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
    output_filename = "corpus_cdelesp_tagged.json"
    with open(output_filename,'w') as f:
        f.write("[")
    # First get metadata from sources.txt
    with open("sources.txt", encoding='utf-8') as sources:
        csvreader = csv.reader(sources, delimiter='\t')
        metadata = {}
        for row in csvreader:
            textid = row[0]
            
##            numwords = row[1]
##            genre = row[2]
##            country = row[3]
##            website = row[4]
##            url = row[5]
##            title = row[6]

            metadata[textid] = row
    
    # Then get text data
    with open("text.txt",encoding='utf-8') as fp:         
        count = 0
##        schema = []
        for text in fp:    
            count = count + 1
##            if count == 2:
##                break            
            mat = re.search(r'@@(\d+? )', text)
            
            textid = mat.group(0)[2:].strip()
            text = text[len(textid):] # get rid of id since we're done with it
            print(textid)
            header = metadata[textid]
##            print(header)
            if len(header) < 6:
                print("Header invalid" + textid)
                continue
            
            t_obj = {}
            t_obj['textid'] = header[0]
            t_obj['numwords'] = header[1]
            t_obj['genre'] = header[2]
            t_obj['country'] = header[3]
            t_obj['website'] = header[4]
            t_obj['title'] = header[5]                
            
            # Clean up transcriptions
            text_input = re.sub(r'(\/)','',text)            
            
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
            
            t_obj['text'] = replacement_text
            if count != 1: #separate texts with comma
                with open(output_filename,'a') as f:
                    f.write(",")
            json.dump(t_obj, open(output_filename,'a', encoding='utf-8'))
            
    with open(output_filename,'a') as f:
        f.write("]")

if __name__ == "__main__":
    main()                                                        
