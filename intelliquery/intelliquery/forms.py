from django import forms

class RAGForm(forms.Form):
    description = forms.CharField(label='Document Description', max_length=200)
    template = forms.ChoiceField(label='Select template')
    document = forms.FileField(label='Upload Document')

    def __init__(self, *args, **kwargs):
        super(RAGForm, self).__init__(*args, **kwargs)

