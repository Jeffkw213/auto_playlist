from dotenv import load_dotenv
import os 
import base64
from requests import post, get
import json

load_dotenv()
me = "/31dggbswzypvuewqq5h5yhc2jmpy"
client_id = "767f923f785d4aaa99b9b279f48ecc49"
client_secret = "6ae3ab4f5ebb4980ac8248a87e8aa143"

def get_token():
    auth_string = client_id + ":" + client_secret
    auth_bytes = auth_string.encode('utf-8')
    base64_bytes = str(base64.b64encode(auth_bytes), 'utf-8')
    
    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + base64_bytes,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "client_credentials"
    }
    result = post(url, headers=headers, data=data)
    json_result = json.loads(result.content)
    token = json_result['access_token']
    return token

def get_auth_header(token):
    return {
        "Authorization": "Bearer " + token
    }

def get_user(token):
    url = "https://api.spotify.com/v1/users"
    headers = get_auth_header(token)
    query_url = url + me
    result = get(query_url, headers=headers)
    json_result = json.loads(result.content)
    print(json_result)
    return 

def get_saved_tracks(token):
    url = f"https://api.spotify.com/v1/me/tracks"
    headers = get_auth_header(token)
    body = {
        "ids": me
    }
    result = post(url, headers=headers, data=body)
    print(result.content)
    json_result = json.loads(result.content)
    return json_result

def search_for_artist(token, artist_name):
    url = "https://api.spotify.com/v1/search"
    headers = get_auth_header(token)
    query = f"?q=artist:{artist_name}&type=artist&limit=1"
    query_url = url + query
    
    result = get(query_url, headers=headers)
    json_result = json.loads(result.content)["artists"]["items"]
    if len(json_result) == 0:
        print("No artist found")
        return None
    return json_result[0]


token = get_token()
get_user(token)
# get_saved_tracks(token)