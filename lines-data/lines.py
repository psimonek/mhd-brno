import requests
import json

# Funkce pro odstranění mezer kolem hodnot v JSON
def remove_spaces(data):
    if isinstance(data, dict):
        return {key.strip(): remove_spaces(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [remove_spaces(item) for item in data]
    elif isinstance(data, str):
        return data.strip()  # Odstraní mezery kolem hodnoty
    return data

# Funkce pro stažení dat z Overpass API
def download_data(line_ref):
    # Definice dotazu
    query = f"""
    [out:json];
    relation["network"="IDS JMK"]["ref"="{line_ref}"]["type"!="disused:route"](49.0928,16.4067,49.3211,16.7953);
    out geom;>;
    node(w)["public_transport"="stop_position"];
    out geom;
    """
    
    # URL Overpass API
    url = "http://overpass-api.de/api/interpreter"
    
    # Odeslání dotazu
    response = requests.post(url, data={'data': query})
    
    # Kontrola úspěšnosti požadavku
    if response.status_code == 200:
        # Získání dat a odstranění mezer
        data = response.json()
        cleaned_data = remove_spaces(data)
        
        # Kontrola velikosti dat
        json_data = json.dumps(cleaned_data, ensure_ascii=False, separators=(',', ':'))  # Minifikace
        if len(json_data.encode('utf-8')) < 1024:  # Kontrola velikosti v bajtech
            print(f"Data pro linku {line_ref} mají méně než 1 kB a nebudou uložena.")
            return
        
        # Uložení dat do souboru
        with open(f"{line_ref}.json", "w", encoding='utf-8') as f:
            f.write(json_data)
        print(f"Data pro linku {line_ref} byla uložena do souboru {line_ref}.json")
    else:
        print(f"Chyba při stahování dat pro linku {line_ref}: {response.status_code}")

# Funkce pro zpracování vstupu od uživatele
def parse_input(user_input):
    line_refs = set()  # Použijeme set pro unikátní hodnoty
    parts = user_input.split(',')
    
    for part in parts:
        part = part.strip()  # Odstranění mezer
        if '-' in part:  # Zpracování rozsahu
            start, end = part.split('-')
            line_refs.update(range(int(start), int(end) + 1))
        else:  # Zpracování jednotlivého čísla
            line_refs.add(str(part))
    
    return sorted(line_refs)  # Vrátí se seřazený seznam

# Hlavní část skriptu
if __name__ == "__main__":
    # Dotaz na uživatele
    user_input = input("Zadejte linky (např. 1, 2, 3 nebo 1-4). Nevyplněné načte všechny: ")

    if not user_input:  # Kontrola, zda je user_input prázdný
        user_input = "1,2,3,4,5,6,7,8,9,10,12,25,26,27,30,31,32,33,34,35,36,37,38,39,40,41,42,44,46,47,48,49,50,E50,52,54,55,E56,57,58,62,64,65,67,68,69,70,72,75,E75,E76,77,78,80,84,Š85,Š86,Š88,N89,N90,N91,N92,N93,N94,N95,N96,N97,N98,N99,211,302,303,403,x4"
    
    line_refs = parse_input(user_input)  # Zpracování vstupu

    for line_ref in line_refs:
        download_data(line_ref)
