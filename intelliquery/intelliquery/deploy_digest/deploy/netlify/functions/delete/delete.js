const nfKey = "nfp_J5duyioivgs2WKeXwJmY89fjvriE8hJV2eeb";

const handler = async (req) => {
    const { next_run } = await req.json();

    try {
        const response = await fetch("https://api.netlify.com/api/v1/sites/6ba3b276-1c36-49bd-b3b5-002a259e38cc", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${nfKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Site deletion failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Site deleted successfully:", data);
    } catch (error) {
        console.error("Error deleting site from Netlify API:", error);
    }

    console.log("Next scheduled run at:", next_run);
};

const config = {
    schedule: "@hourly" // This will run every hour until the site is deleted
};

module.exports = { handler, config };