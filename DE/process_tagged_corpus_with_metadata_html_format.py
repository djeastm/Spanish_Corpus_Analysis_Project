from bs4 import BeautifulSoup # This is an open source HTML/XML parser
import re
import csv
import subprocess
import collections
from es_parser import parser

def main():     
        
    with open('CorpusCordial_Tagged_HTML.html' ,encoding='utf8') as fp:            
        soup = BeautifulSoup(fp, 'lxml')
        texts = soup.find_all('text')
        # Add h2 HTML tags to separate texts
        # TODO breakdown metadata in texthead class
        # and display nicely in HTML
        for text in texts:
            header_tag = soup.new_tag("h2")
            header_tag.string = text['id']
            text.insert(0,header_tag)
            # TEST print(text.h2)        
        
        heads = soup.find_all('div','texthead')
        for head in heads:
            #print("Before: "+head.string)            
            metadata_lines = head.string.split("@")
            head.clear()
            for line in metadata_lines:                
                m = re.search(r'(.*?):(.*)', line)
                if m:
                    #print(line)
                    attr = m.group(1).lower()
                    key = '_'.join(attr.split())
                    
                    meta_tag = soup.new_tag('div', metaclass=key)
                    meta_tag.string = line.rstrip()                
                    head.append(meta_tag)
            
            #print("After: "+head)
            
        
        
    with open("CorpusCordial_Tagged_HTML_Formatted.html",'w',encoding='utf8') as out:
        out.write(str(soup.decode(formatter="html")))
            
            
         
                            
if __name__ == "__main__":
    main()                                                        
