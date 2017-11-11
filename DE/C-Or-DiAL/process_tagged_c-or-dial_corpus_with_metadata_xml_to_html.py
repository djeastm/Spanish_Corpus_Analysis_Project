from bs4 import BeautifulSoup # This is an open source HTML/XML parser
import re
import csv
import subprocess
import collections
from es_parser import parser

def main():
    loaded_file = 'CorpusCordial_Tagged_HTML.xml'    
        
    with open(loaded_file,encoding='utf8') as fp:            
        soup = BeautifulSoup(fp, 'xml')
        soup.corpus.name = "html"
        heads = soup.find_all('head')
        for head in heads:            
            head.name = "div class=\"texthead\""
        bodies = soup.find_all('body')
        for body in bodies:  
            body.name = "div class=\"textbody\""
        
        with open("CorpusCordial_Tagged_HTML.html",'w', encoding='utf-8') as corpus:
            corpus.write(str(soup.decode(formatter="html")))    
        
            
            
            
         
                            
if __name__ == "__main__":
    main()                                                        
