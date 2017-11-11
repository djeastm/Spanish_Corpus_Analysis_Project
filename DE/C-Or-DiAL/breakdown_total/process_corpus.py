from bs4 import BeautifulSoup # This is an open source HTML/XML parser
import re

def main():
    loaded_file = 'CorpusCordial_Cleaned.xml'
    with open(loaded_file,encoding='utf8') as fp:            
        soup = BeautifulSoup(fp, 'xml')
        texts = soup.find_all('text') # Finds all the texts
        corpus = ''
        for text in texts: # Loop through the texts
            bodystring = ''
            for string in text.body.strings: # Get the body (ignore the head)
                # strip the body of parens and brackets
                temp = re.sub(r'(\( )|( \))|(< )|( >)','',string)
                # strip the result of single-quotes
                bodystring += str(temp).strip('\'')        
            # Strip the bodystring of tags to just leave raw text for analysis
            corpus += re.sub(r'(\*.*:)|\[(\/)+\]|\/|(\&[a-z][a-z])','',bodystring)        
        with open ('raw_output.txt','w',encoding='utf8') as out:
            # output to a text file
            out.write(corpus)
        
if __name__ == "__main__":
    main()                                                        
