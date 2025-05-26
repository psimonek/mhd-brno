import requests

def save_diversions():
    url = "https://dpmbinfo.dpmb.cz/api/diversions"
    response = requests.get(url)
    
    if response.status_code == 200:
        with open("diversions.json", "w", encoding="utf-8") as json_file:
            json_file.write(response.text)
        print("Data byla úspěšně uložena do diversions.json.")
    else:
        print(f"Chyba při načítání dat: {response.status_code}")

if __name__ == "__main__":
    save_diversions()
