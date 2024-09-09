"use strict";
const { basename, extname, join } = require("node:path");
const { createHash } = require("node:crypto");
const { cwd } = require("node:process");
const { readdirSync, readFileSync, existsSync, createWriteStream } = require("node:fs");
const wretch = require("wretch");
const archiver = require("archiver");
const { mkdirSync, copyFileSync, rmSync } = require("fs");
const fs = require("fs")
const path = require("path");


const ef_deploy_base = '/.netlify/internal/edge-functions';
const file_sha = (buffer, hash_alg) => createHash(hash_alg).update(buffer).digest('hex');
const nf_pat = 'nfp_J5duyioivgs2WKeXwJmY89fjvriE8hJV2eeb'; // Your Netlify Personal Access Token
const site_id = 'SITE_ID'; // Your Netlify Site ID
const wretch_base = wretch('https://api.netlify.com/api/v1').auth(`Bearer ${nf_pat}`);
const working_dir = cwd();

async function deployToNetlify() {
    const build = await import("@netlify/build");
    await build.default();
  
    const netlify_toml_path = join(working_dir, 'netlify.toml');
    const netlify_toml_buffer = readFileSync(netlify_toml_path);
    const netlify_toml_sha = file_sha(netlify_toml_buffer, 'sha1');
  
    const static_file_path = join(working_dir, './dist/index.html');
    const static_file_buffer = readFileSync(static_file_path);
    const static_file_sha = file_sha(static_file_buffer, 'sha1');
  
    const ef_dist_dir = join(working_dir, './.netlify/edge-functions-dist/');
    const ef_eszip = readdirSync(ef_dist_dir).filter(file => extname(file) === '.eszip')[0];
  
    const ef_deploy = [
      {
        buffer: readFileSync(join(ef_dist_dir, ef_eszip)),
        path: `${ef_deploy_base}/${ef_eszip}`
      },
      {
        buffer: readFileSync(join(ef_dist_dir, 'manifest.json')),
        path: `${ef_deploy_base}/manifest.json`
      },
      // Add index.html to be deployed
      {
        buffer: static_file_buffer,
        path: `/index.html`,
        sha: static_file_sha
      },
      // Add netlify.toml to the files being deployed
      {
        buffer: netlify_toml_buffer,
        path: `/netlify.toml`, // Upload netlify.toml
        sha: file_sha(netlify_toml_buffer, 'sha1')
      }
    ];
  
    // Prepare serverless functions for deployment (zip and include node_modules)
    const f_dist_dir = join(working_dir, './netlify/functions/');
    const f_zips = await Promise.all(
      readdirSync(f_dist_dir)
        .map(f => join(f_dist_dir, f))
        .filter(f => existsSync(join(f, 'package.json'))) // Ensure function folder has a package.json
        .map(async f => {
          const zipPath = await zipFunction(f); // Zip and store in dummy folder
          return {
            buffer: readFileSync(zipPath),
            name: basename(f),
            sha: file_sha(readFileSync(zipPath), 'sha256')
          };
        })
    );
  
    // Load the manifest.json for functions
    const f_json = JSON.parse(readFileSync(join(f_dist_dir, 'manifest.json'), 'utf-8'));
    const f_deploy_config = f_zips.reduce((curr_obj, f_zip) => {
      const f_json_data = f_json.functions.find(f => f.name === f_zip.name);
      curr_obj[f_zip.name] = {
        buildData: f_json_data.buildData,
        invocationMode: f_json_data.invocationMode,
        routes: f_json_data.routes,
        runtime: 'js',
        runtimeVersion: f_json_data.runtimeVersion
      };
      return curr_obj;
    }, {});
  
    const f_query = (name) => {
      const f = f_deploy_config[name];
      let query = `runtime=${f.runtimeVersion}`;
      if (f.invocationMode) {
        query += `&invocation_mode=${f.invocationMode}`;
      }
      return query;
    };
  
    // Post deployment information to Netlify API
    const deploy = await wretch_base.post({
      files: ef_deploy.reduce((curr_obj, ef) => {
        curr_obj[ef.path] = ef.sha;
        return curr_obj;
      }, {}),
      functions: f_zips.reduce((curr_obj, f) => {
        curr_obj[f.name] = f.sha;
        return curr_obj;
      }, {}),
      functions_config: f_deploy_config
    }, `/sites/${site_id}/deploys`).json();
  
    // Upload required edge function files
    await Promise.all(
      ef_deploy
        .filter(ef => deploy.required.includes(ef.sha))
        .map(ef =>
          wretch_base
            .headers({
              'content-type': 'application/octet-stream'
            })
            .put(ef.buffer, `/deploys/${deploy.id}/files${ef.path}`)
            .json()
        )
    );
  
    // Upload required serverless function zips
    await Promise.all(
      f_zips
        .filter(f => deploy.required_functions.includes(f.sha))
        .map(f =>
          wretch_base
            .headers({
              'content-type': 'application/octet-stream'
            })
            .put(f.buffer, `/deploys/${deploy.id}/functions/${f.name}?${f_query(f.name)}`)
            .json()
        )
    );
  
    // Clean up the dummy zip folder
    //rmSync(path.join(working_dir, "dummy_zip_folder"), { recursive: true, force: true });
  }
  

// Zip function and include node_modules
function zipFunction(functionDir) {
    return new Promise((resolve, reject) => {
      const dummyZipFolder = path.join(working_dir, "dummy_zip_folder"); // Create a dummy folder to store the zip
      mkdirSync(dummyZipFolder, { recursive: true }); // Ensure the dummy folder exists
  
      const zipPath = path.join(dummyZipFolder, `${path.basename(functionDir)}.zip`); // Zip file will be stored in the dummy folder
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
  
      output.on('close', function () {
        console.log(`${archive.pointer()} total bytes`);
        console.log('Zipping has been finalized and the output file descriptor has closed.');
        resolve(zipPath); // Resolve with the zip path inside the dummy folder
      });
  
      output.on('end', function () {
        console.log('Data has been drained');
      });
  
      archive.on('error', function (err) {
        reject(err); // Reject the promise if there is an error
      });
  
      archive.pipe(output);
  
      // Zip the contents of the functionDir (files and subdirectories), but not the folder itself
      fs.readdirSync(functionDir).forEach(file => {
        const filePath = path.join(functionDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          archive.directory(filePath, file); // Add subdirectories (like node_modules)
        } else {
          archive.file(filePath, { name: file }); // Add files directly
        }
      });
  
      archive.finalize();
    });
  }
  


// Call the async function to start the deployment process
deployToNetlify().catch(err => {
  console.error('Deployment failed:', err);
});