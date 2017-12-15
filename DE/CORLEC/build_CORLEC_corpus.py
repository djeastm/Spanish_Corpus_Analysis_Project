from bs4 import BeautifulSoup # This is an open source HTML/XML parser
import re
import csv
import subprocess
import collections
from es_parser import parser

def main():
    loaded_file = 'raw_CORLEC.txt'    
        
    with open(loaded_file,encoding='utf8') as fp:
        raw = fp.read()
        texts = raw.split("|TEXTSEPARATOR|")
        htmloutput = "<div id=\"corpus\" class=\"column middle\">\n"
        count = 0
        for text in texts:
            count = count + 1
##            if count > 3:
##                continue                        
            lines = text.split("\n")
            if count == 1: # first line treated differently
                text_id = lines[0][-8:].lower()
            else:
                text_id = lines[1][-8:].lower()
            if text_id[1:4] in situations.keys():
                situation = situations[text_id[1:4]]
            else:
                print("situationerror: "+text_id)
                continue
            print(str(count) + ": " + text_id)
            
            htmloutput += "<text id=\""+text_id+"\"><h2>"+text_id+"</h2>\n"
            htmloutput += "<div class=\"texthead\">\n"            
            header = "<div metaclass=\"situación\">situación: "+situation+"</div>"
            body = ''
            last = 0
            for idx,line in enumerate(lines):
                if line == '': continue
                if line.strip().startswith("#"): #header                    
                    m = re.search(r'#(.*?):(.*)', line)
                    if m:
                        #print(line)
                        attr = m.group(1).lower()
                        key = '_'.join(attr.split())
                        
                        meta_tag_start = "<div metaclass=\""+key+"\">"
                        meta_tag_string = line.rstrip()[1:]                
                        meta_tag_end = "</div>"
                    header += meta_tag_start+meta_tag_string+meta_tag_end
                else:
                    last = idx
                    break
            htmloutput += header + "</div>\n<div class=\"textbody\">\n"
            for line in lines[last:]:                
                body += line+"\n"

            text_input = re.sub(r'(.*:)|(\[.*?\])','',body)

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
            
            body = replacement_text
            
            htmloutput += body + "</div>\n"
            htmloutput += "</text>\n"
            
        htmloutput += "</div>"

        with open("CorpusCORLEC.html",'w', encoding='utf-8') as corpus:
            corpus.write(htmloutput)

situations = {"adm":"Administrativos",
            "cie":"Científicos",
            "con":"Conversacionales o familiares",
            "edu":"Educativos",
            "hum":"Humanísticos",
            "ins":"Instrucciones",
            "jur":"Jurídicos",
            "lud":"Lúdicos",
            "pol":"Políticos",
            "deb":"Debates",
            "dep":"Deportes",
            "doc":"Documentales",
            "ent":"Entrevistas",
            "not":"Noticiario",
            "pub":"Publicitarios",
            "rel":"Religiosos",
            "tec":"Técnicos"}
                         
if __name__ == "__main__":
    main()                                                        
