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
    output_filename = "corpus_preseea_tagged.json"
    with open(output_filename,'w') as f:
        f.write("[")
    with open("raw_corpus.txt",encoding='utf-8') as fp:
        corpus = fp.read()
        texts = corpus.split("|TEXTSEPARATOR|")
        count = 0
##        schema = []
        for text in texts:
            if len(text) < 10: continue # ignore last split
            count = count + 1
##            if count == 2:
##                break
        
##            print(str(raw_text))
            end_header_index = text.find("</Trans>") # select header information only
            header = text[:end_header_index+8]            
            soup = BeautifulSoup(header, 'lxml-xml')
            text_tag = soup.new_tag("text")
            
            # Clean up transcriptions
            text_input = re.sub(r'(\/)|(<.*?>)','',text[end_header_index+8:])            
            
            process = subprocess.Popen(['E:\_Downloads\\freeling-4.0-win64\\freeling\\bin\\analyzer.bat',
                                        '-f', 'es.cfg'],
                                       stdout=subprocess.PIPE,
                                       stdin=subprocess.PIPE,
                                       stderr=subprocess.PIPE,
                                       shell=True)
            out,err = process.communicate(input=text_input.encode('utf-8'))
            freeling_output = out.decode()

            replacement_text = ''
            last_pos = 0
            last_word = ''
            last_tag = ''
            skip_flag = False
            check = False
            for line in freeling_output.splitlines():
                search = True   
                if skip_flag:
                    skip_flag = False
                    continue
                elements = line.split(" ")
                if len(elements) >= 3:
                    source_word = elements[0]           # Get first word of freeling_output line
                    tag = elements[2]                   # Get tag
                    
                    source_word = re.sub('_',' ',source_word)   # Replace underscore with blank (since Freeling does reverse)
##                    print(source_word)
                                       
                    source_word = last_word + source_word
                    tag = last_tag + tag
                    
                    if source_word.endswith('ael'):                        
                        source_word = source_word[:len(source_word)-3]+'al'
                    if source_word.endswith('deel'):
                        source_word = source_word[:len(source_word)-4]+'del'
                    if source_word == '...':
                        continue

                    if tag.startswith("F"): # ignore punctuation
                        tagged_word = source_word
                        if tag.startswith("Fp") or tag.startswith("Fit") or tag.startswith("Fat"):
                            tagged_word += " "  # add a space after ".","?", and "!"
                    else:
                    ## Build tagged word that will replace source word in corpus
                        tagged_word = '<w t="'+tag+'">'+source_word+' </w>'

                    
                    replacement_text += tagged_word                    

            #print(replacement_text)
            text_html_body = re.sub(r'(<w t="[A-Z,0-9]*">([A-Z])\.* <\/w>:)',r'<br>\g<2>: ',replacement_text)

##            with open("test.html",'w') as test:
##                test.write(text_html_body)
                
            text_tag.string = text_html_body #put rest of text in its own tag
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
##                    if k not in schema:
##                        schema.append(k)
            
                if count != 1: #separate texts with comma
                    with open(output_filename,'a') as f:
                        f.write(",")
                json.dump(flat_clean, open(output_filename,'a', encoding='utf-8'))
            except:                
                print("Expat Error in "+count)
##        for key in schema:
##            print(key+',', end="")
    with open(output_filename,'a') as f:
        f.write("]")
    
            
    ##            json_str = json.dumps(d)
            
    ##            with open("CorpusPRESEEA.html",'w', encoding='utf-8') as corpus:
    ##                corpus.write(htmloutput)

if __name__ == "__main__":
    main()                                                        
