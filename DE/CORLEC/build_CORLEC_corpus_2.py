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
    output_filename = "corpus_corlec_tagged.json"
    with open(output_filename,'w') as f:
        f.write("[")
    with open("CorpusCORLEC.html",encoding='utf-8') as fp:
        soup = BeautifulSoup(fp, 'lxml')
        texts = soup.find_all('text')               
        count = 0;
        for t in texts:
            t_obj = {}
            count = count + 1
            print(count)
##            if count == 3:
##                break
            
            # Header
            head = t.find("div", class_='texthead')            
            sit = head.find("div", attrs={"metaclass":"situación"})
            # Add "situación" to the situation label
            sit.string = "Situación: "+sit.string.strip()            
            head_contents = t.find("div", class_='texthead').contents
            for m in head_contents:
                if m == "\n": continue                
                line = m.string.split(":");
                metaclass = line[0]
                rest = ":".join(line[1:])
                t_obj[metaclass] = rest
            # Text            
            text_contents = t.find("div", class_='textbody').contents
            text_tag = soup.new_tag("t")
            text_html_body = ""
            for txt in text_contents:
                text_html_body += str(txt)
            t_obj['text']=text_html_body
            
            
            if count != 1: #separate texts with comma
                with open(output_filename,'a') as f:
                    f.write(",")
            json.dump(t_obj, open(output_filename,'a', encoding='utf-8'))         
    with open(output_filename,'a') as f:
        f.write("]")

if __name__ == "__main__":
    main()                                                        
