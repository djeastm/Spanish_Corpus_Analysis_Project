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
            for entry in header:
                m = re.search(r'(.*?):(.*)', entry)
                attr = m.group(1).lower()
                key = '_'.join(attr.split())
                header_dict[key] = m.group(2).lstrip()
##                if key == 'palabras_clave':                           # Used to get set of key_words
##                    for word in header_dict[key].split(","):          # Not needed for normal operation
##                        key_words.add(word.strip().lower())            
            #header_dict = collections.OrderedDict(sorted(header_dict.items(), key=lambda t:t[0]))
            #print(header_dict)
            with open("metadata.csv",'a', encoding='utf-8',newline='') as metadata:            
                metawriter = csv.writer(metadata, delimiter=',', quotechar='"')
                if count == 1:
                    metawriter.writerow(header_dict.keys()) # print header row on first line
                metawriter.writerow(header_dict.values()) 
            
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
            
            count_dict = {}
            for line in freeling_output.splitlines():
                elements = line.split(" ")                
                if len(elements) >= 3:
                    #word = elements[0] # the actual word in the raw text
                    root = elements[1] # the root word determined by FreeLing
                    code = elements[2] # the FreeLing code (e.g. AQ0MS0)
                    confidence = elements[3]
                    # Each analyzed term has a confidence attached
                    # Chose .25 as floor, but can be changed if necessary
                    if float(confidence.strip()) >= 0.25:   
                        if code in count_dict:
                            if root in count_dict[code]:
                                count_dict[code][root] = count_dict[code][root]+1
                            else:
                                count_dict[code][root] = 1
                        else:
                            count_dict[code] = {root:1}
            #print(count_dict)                            
            breakdown = create_breakdown(text_id, count_dict)
            
            parser.parse(breakdown)
##        for word in key_words:  # for printing all the key words
##            print(word)
         

def create_breakdown(text_id, dictionary):  
    sorted_PoS = sorted(dictionary.items())
    breakdown = ''
    for roots in list(sorted_PoS):
        code = roots[0]
        sorted_roots = sorted(roots[1].items())
        for root in list(sorted_roots):
            breakdown += code+" "+root[0]+" "+str(root[1])+" "+text_id+"\n"
    return breakdown
                            
if __name__ == "__main__":
    main()                                                        
