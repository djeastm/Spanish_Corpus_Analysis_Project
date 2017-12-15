from bs4 import BeautifulSoup # This is an open source HTML/XML parser
import re
import csv
import subprocess
import collections
import os
import xmltodict
import json
from flatten_json import flatten

def main():
    with open("corpus_preseea.json",'a') as f:
        f.write("[")
    with open("raw_corpus.txt",encoding='utf-8') as fp:
        corpus = fp.read()
        texts = corpus.split("|TEXTSEPARATOR|")
        count = 0
        schema = []
        for text in texts:
            if len(text) < 10: continue # ignore last split
            count = count + 1
##            if count == 5:
##                break
        
##            print(str(raw_text))
            end_header_index = text.find("</Trans>") # select header information only
            header = text[:end_header_index+8]            
            soup = BeautifulSoup(header, 'lxml-xml')
            text_tag = soup.new_tag("text")
            text_tag.string = text[end_header_index+8:] #put rest of text in its own tag
            text_name = soup.Datos['clave_texto']
            print(text_name.strip())
            text_xml = soup.Trans
            text_xml.append(text_tag)
    
            try:
                d = xmltodict.parse(str(text_xml))
                flat = flatten(d)
    ##            print(flat)
                flat_clean = {}
                for k, v in flat.items():      
                    k = k.strip()
                    k = k.replace("@","")
                    k = k.replace(":","_")
                    k = k.replace("#","")
                    k = k.replace("Trans_","")
                    v = v.strip()
                    v = v.replace("'","")                                   
                    flat_clean[k] = v
                    if k not in schema:
                        schema.append(k)
            
                if count != 1: #separate texts with comma
                    with open("corpus_preseea.json",'a') as f:
                        f.write(",")
                json.dump(flat_clean, open("corpus_preseea.json",'a'))
            except:                
                print("Expat Error in "+count)
        for key in schema:
            print(key+',', end="")
    with open("corpus_preseea.json",'a') as f:
        f.write("]")
    
            
    ##            json_str = json.dumps(d)
            
    ##            with open("CorpusPRESEEA.html",'w', encoding='utf-8') as corpus:
    ##                corpus.write(htmloutput)

if __name__ == "__main__":
    main()                                                        
