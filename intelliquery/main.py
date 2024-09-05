import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'intelliquery.settings')
from intelliquery.models import Person


# Creating a new record
person = Person(name="John Doe", age=30)
person.save()

# Retrieving records
all_people = Person.objects.all()
print(all_people)