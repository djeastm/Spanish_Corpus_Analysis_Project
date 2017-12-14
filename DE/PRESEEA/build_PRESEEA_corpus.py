from bs4 import BeautifulSoup # This is an open source HTML/XML parser
import re
import csv
import subprocess
import collections
import os
import xmltodict
import json
from flatten_json import flatten
#from es_parser import parser

def main():
    path = 'IndividualTextsArchive/'

##    htmloutput = "<div id=\"corpus\" class=\"column middle\">\n"
    count = 0

    for filename in os.listdir(path):
        with open(path+filename,encoding='ISO-8859-1') as fp:
            if count == 1:
                break
            count = count + 1
            if filename.startswith("_"):
                filename = filename[1:]
            print(filename)
            raw_text = fp.read()
            end_header_index = raw_text.find("</Trans>") # select header information only
            
            soup = BeautifulSoup(raw_text[:end_header_index+8], 'lxml-xml')
            text_tag = soup.new_tag("text")
            text_tag.string = raw_text[end_header_index+8:] #put rest of text in its own tag
            text = soup.Trans
##            text.append(text_tag)
##            id_tag = soup.new_tag("id")
##            id_tag.string = str(count)
##            text.append(id_tag)
            d = xmltodict.parse(str(text))
            flat = flatten(d)
##            print(flat)
            # For Schema (replace @ symbol with one that can be used in keypath)
            for k, v in flat.items():                
                flat[k] = v.replace("'","")
                old = k
                new = k.replace("@","DE_")
                flat[new] = flat.pop(old)
                flat[new.replace("Trans_","")] = flat.pop(new)

            for k, v in flat.items():
                print(k+',', end="")
            
            
            json.dump(flat, open("test_2.json",'w'))
##            json_str = json.dumps(d)
            
##            with open("CorpusPRESEEA.html",'w', encoding='utf-8') as corpus:
##                corpus.write(htmloutput)

if __name__ == "__main__":
    main()                                                        
