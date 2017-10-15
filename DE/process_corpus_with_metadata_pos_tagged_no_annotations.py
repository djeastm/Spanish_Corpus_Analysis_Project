from bs4 import BeautifulSoup # This is an open source HTML/XML parser
import re
import csv
import subprocess
import collections
from es_parser import parser

def main():
    loaded_file = 'CorpusCordial_Cleaned.xml'    
        
    with open(loaded_file,encoding='utf8') as fp:            
        soup = BeautifulSoup(fp, 'xml')
        texts = soup.find_all('text') # Finds all the texts
        count = 0
##        key_words = set()      # For finding the set of possible key words in all the texts
        for text in texts: # Loop through the texts
            count = count + 1
##            if count != 10:
##                continue
            text_id = text['id']
            print(str(count) + ": " + text_id)
            
            ## Process Body Text            
            bodystring = ''            
            for string in text.body.strings: # Get the body
                # strip the body of parens and brackets
                temp = re.sub(r'(\( )|( \))|(< )|( >)','',string)
                # strip the result of single-quotes
                bodystring += str(temp).strip('\'')        
            # Strip the bodystring of tags to just leave raw text for analysis
            text_input = re.sub(r'(\*.*:)|\[(\/)+\]|\/|(\&[a-z][a-z])','',bodystring)
            
            # Call FreeLing analyzer for each text
            # This directory should point to wherever FreeLing is downloaded
            process = subprocess.Popen(['E:\_Downloads\\freeling-4.0-win64\\freeling\\bin\\analyzer.bat',
                                        '-f', 'es.cfg'],
                                       stdout=subprocess.PIPE,
                                       stdin=subprocess.PIPE,
                                       stderr=subprocess.PIPE,
                                       shell=True)
            out,err = process.communicate(input=text_input.encode('utf-8'))
            freeling_output = out.decode()

            text_process = str(text.body)[6:-7]  # the indices remove the "body" tag from the text
            
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

                    ## Build tagged word that will replace source word in corpus
                    tagged_word = '<w t="'+tag+'">'+source_word+'</w>'

                    
                    replacement_text += tagged_word                    

            #print(replacement_text)
            
            body_soup = BeautifulSoup('<body>'+replacement_text+'</body>', 'xml')
            new_body = body_soup.body            
            text.body.replace_with(new_body)
##            for tag in text.body.find_all(t=re.compile(r'^V.*')):
##                print(tag)
        with open("CorpusCordial_Tagged.xml",'w', encoding='utf-8') as corpus:
            corpus.write(str(soup))
           
            
            
            
         
                            
if __name__ == "__main__":
    main()                                                        
