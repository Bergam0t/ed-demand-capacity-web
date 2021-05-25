import sys
sys.path.append("..") 
# from models import Organisation, Site
import requests

orgs_and_sites = requests.get('https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations?Roles=RO197,RO198')

orgs_and_sites.json()
