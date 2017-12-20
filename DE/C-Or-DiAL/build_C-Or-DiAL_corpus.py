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
    output_filename = "corpus_cordial_tagged.json"
    with open(output_filename,'w') as f:
        f.write("[")
    with open("CorpusCordial_Tagged_HTML.xml",encoding='utf-8') as fp:
        soup = BeautifulSoup(fp, 'xml')
        texts = soup.find_all('text')
        count = 0;
        for t in texts:
            t_obj = {}
            count = count + 1
            print(count)
##            if count == 3:
##                break
            
            # Header            
            metaclasses = t.head.string.split("@")
##            print(metaclasses)
##            t.head.clear()
            for m in metaclasses:                                
                if m == "\n": continue
                line = m.split(":");
                metaclass = line[0]
                rest = ":".join(line[1:])
                t_obj[metaclass] = rest
            # Text
            text_contents = t.body.contents
            text_tag = soup.new_tag("t")
            text_html_body = ""
##            print(text_contents)
            for txt in text_contents:
                text_html_body += str(txt)
##            print(text_tag)
##            t.head.append(text_tag)
            t_obj['text']=text_html_body
            

##            print(str(t.head))
            
##            try:
##                print(t.head)
##                d = xmltodict.parse(t.head)
##                flat = flatten(d)
##    ##            print(flat)
##                flat_clean = {}
##                for k, v in flat.items():      
##                    k = k.strip()
##                    k = k.replace("@","")
##                    k = k.replace(":","_")
##                    k = k.replace("#","")
##                    #k = k.replace("Trans_","")
##                    v = v.strip()
##                    v = v.replace("'","")                                   
##                    flat_clean[k] = v
##    ##                    if k not in schema:
##    ##                        schema.append(k)
            
            if count != 1: #separate texts with comma
                with open(output_filename,'a') as f:
                    f.write(",")
            json.dump(t_obj, open(output_filename,'a', encoding='utf-8'))
##            except:                
##                print("Expat Error in "+count)
    ##        for key in schema:
    ##            print(key+',', end="")
    with open(output_filename,'a') as f:
        f.write("]")
    
            
    ##            json_str = json.dumps(d)
            
    ##            with open("CorpusPRESEEA.html",'w', encoding='utf-8') as corpus:
    ##                corpus.write(htmloutput)

if __name__ == "__main__":
    main()                                                        
