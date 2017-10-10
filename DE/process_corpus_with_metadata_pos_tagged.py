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
            if count == 1:
                break
            count = count + 1
            text_id = text['id']
            #print(text_id)

            ## Process Text Header Information
            header = text.head.string.replace('\n','').split("@")
            del header[0] # Remove extra space at start of header
            header_dict = collections.OrderedDict([('archivos','n/a'),
                                                   ('duración_y_número_de_palabras','n/a'),
                                                   ('funciones_comunicativas','n/a'),
                                                   ('grabación_original','n/a'),
                                                   ('nivel_para_la_comprensión_del_texto','n/a'),
                                                   ('observaciones_lingüísticas','n/a'),
                                                   ('palabras_clave','n/a'),
                                                   ('palabras_nuevas','n/a'),
                                                   ('participantes','n/a'),
                                                   ('relación_entre_los_participantes','n/a'),
                                                   ('situación','n/a'),
                                                   ('tema','n/a'),
                                                   ('tema_general','n/a'),
                                                   ('text_id','n/a'),
                                                   ('transcriptores_y_revisores','n/a'),
                                                   ('text_id',text_id),
                                                   ('título','n/a'),
                                                   ('uso_didáctico','n/a')])            
##            for entry in header:
##                m = re.search(r'(.*?):(.*)', entry)
##                attr = m.group(1).lower()
##                key = '_'.join(attr.split())
##                header_dict[key] = m.group(2).lstrip()
##                if key == 'palabras_clave':                           # Used to get set of key_words
##                    for word in header_dict[key].split(","):          # Not needed for normal operation
##                        key_words.add(word.strip().lower())            
            #header_dict = collections.OrderedDict(sorted(header_dict.items(), key=lambda t:t[0]))
            #print(header_dict)
##            with open("metadata.csv",'a', encoding='utf-8',newline='') as metadata:            
##                metawriter = csv.writer(metadata, delimiter=',', quotechar='"')
##                if count == 1:
##                    metawriter.writerow(header_dict.keys()) # print header row on first line
##                metawriter.writerow(header_dict.values()) 
            
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

##            bodystring = ''
##            for string in text.body.strings:
##                bodystring += string
            
##            text_process = str(text.body.)[6:-7]  # the indices remove the "body" tag from the text
            text_process = text.body.get_text()
            replacement_text = ''
            last_pos = 0
            skip_flag = False
            for line in freeling_output.splitlines():
                if skip_flag:
                    skip_flag = False
                    continue
                elements = line.split(" ")
                if len(elements) >= 3:
                    source_word = elements[0]           # Get first word of freeling_output line
                    tag = elements[2]                   # Get tag
                    source_word = re.sub('_',' ',source_word)   # Replace underscore with blank (since Freeling does reverse)
##                    print(source_word)
                    if source_word == 'a':
                        if "al " in text_process[last_pos:last_pos+5]:
                            last_pos = last_pos + 4
                            skip_flag = True
                            continue
                    if source_word == 'de':                        
                        if "del " in text_process[last_pos:last_pos+5]:
                            last_pos = last_pos + 4
                            skip_flag = True
                            continue
                    if source_word == '...':
                        continue
                    pattern = re.compile('\\b'+source_word+'\\b')                   
                    tagged_word = '<w t='+tag+'>'+source_word+'</w>'
##                    text_process = re.sub(pattern,tagged_word,text_process, count=1)
                    word_search = pattern.search(text_process, last_pos)
##                    print(word_search)
                    if word_search:
                        
##                        print(word_search.group(0))
                        word_start_index = word_search.start()                        
##                        word_end_index = word_search.end()                        
##                    tagged_word = '<w t='+tag+'>'+source_word+'</w>'           
##                        text_process = re.sub(source_word,tagged_word,text_process)
                        replacement_text += text_process[last_pos:word_start_index]+tagged_word
                        last_pos = word_search.end()
                

            print(replacement_text)
                
##            text.body.replace_with(replacement_text)
##            print(text.body.encode(formatter=None))
           
            
            
            
         
                            
if __name__ == "__main__":
    main()                                                        
