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
                    if tag.startswith('F'):             # Ignore punctuation for this analysis
                        continue
                    source_word = re.sub('_',' ',source_word)   # Replace underscore with blank (since Freeling does reverse)
##                    print(source_word)

                    ## Check edge cases and make adjustments before search for word in corpus
##                    if source_word == 'a':
##                        m = re.search(r'\bal\b',text_process[last_pos:last_pos+5])
##                        if m:
##                            last_pos = m.end()
##                            skip_flag = True
##                            continue
##                    if source_word == 'de':
##                        m = re.search(r'\bdel\b',text_process[last_pos:last_pos+5])
##                        if m:
##                            last_pos = m.end()
##                            skip_flag = True
##                            continue
                    
                                       
                    source_word = last_word + source_word
                    tag = last_tag + tag
                    
                    if source_word.endswith('ael'):                        
                        source_word = source_word[:len(source_word)-3]+'al'
                    if source_word.endswith('deel'):
                        source_word = source_word[:len(source_word)-4]+'del'
                    if source_word == '...':
                        continue

                    source_word = re.escape(source_word)    # to ensure punctuation doesn't interfere with regex
                    
                    ## Build tagged word that will replace source word in corpus
                    tagged_word = '<w t="'+tag+'">'+source_word+'</w>'

                    
                    # TEST print(source_word)

                    ## Loop until word is either found or word abandoned
                    
                    while search:                        
                        # Build pattern to find word, using two cases:
                        # First case is closed (i.e. a word that is separated by spaces at beginning and end)
                        # Second case is open (i.e. a word that is separated by a space at the front, but not necessarily at the end)
                        # We need the open case for compound words like "mostrarlo", which is separated into 'mostrar' and 'lo' in Freeling
                        pattern_open = re.compile('(&amp;|\\b)'+source_word)    # Need '&amp;' for edge case where corpus begins word with '&amp;'
                        pattern_closed = re.compile('(&amp;|\\b)'+source_word+'\\b') 
                        
                        # In an ideal setting, we would only need to check the very next word to see if it's the correct one
                        # But our XML has annotation tags,etc, that could be quite long that interrupt our raw text.
                        # So we have to do a general search. We try to minimize how much we need to search by
                        # 1) starting only from where we've left off, and
                        # 2) only looking out 200 characters from where we left off
                        # The 200 is something of a magic number that attempts to compromise between *missing* a word
                        # because it's past a bunch of XML tags and *erroneously matching* a word that's paragraphs away
                        # (and thus messes up the entire rest of the text's parsing)                                           
                        
                        word_search_open = pattern_open.search(text_process, last_pos, last_pos + 100)
                        word_search_closed = pattern_closed.search(text_process, last_pos, last_pos +100)
                        
                    
                                                                      
                        if word_search_open:
                            # The word is found with a space at the beginning
                            word_start_index_open = word_search_open.start() # Save the index of that word
                            if word_search_closed:
                                # The word is found with both a space at both the beginning and end
                                word_start_index_closed = word_search_closed.start() # Save the index of that word
                                # TEST print(str(word_search_open.start()) + " : " + str(word_search_closed.start()))
                                # Check to see if open and closed indices match
                                if word_start_index_open == word_start_index_closed:
                                    # TEST print(word_search_open.group() + " : " + word_search_closed.group())
                                    # If so, we've got a word that can be replaced in the corpus
                                    # This is a good match, either normal, non-compound, or compound with no conflicts
                                    # We add everything in the corpus from where we left off up to this point
                                    # adding the tagged word we built. This essentially 'rebuilds' the corpus bit by bit
                                    # to be replaced in the XML
                                    replacement_text += text_process[last_pos:word_start_index_open]+tagged_word                                    
                                    last_pos = word_search_closed.end() # Save the last position of the search to start off next time
                                    # Since this word is complete, we can reset any lingering saved words/tags
                                    # TEST print('Last_pos: '+str(last_pos))
                                    last_word = ''
                                    last_tag = ''
                                    check = False
                                    search = False # Drop out of the loop
                                else:
                                    print('Open ahead of closed: '+source_word)
                                    # If the indices don't match, the open word is ahead of the closed word
                                    ## E.g. Our source word is 'hacer' and our corpus text looks like "hacerlo....hacer"
                                    ## The open search matched "[hacer]lo" while the closed search matched the second "hacer"
                                    # (The converse is impossible, since in the case "hacer....hacerlo", the open and closed searches
                                    # would match the first hacer.)                                    
                                    # So we need to check again, combining the current word with the next word and checking to see if
                                    # the combined word is in the corpus
                                    # On the one hand, we could be correctly combining "hacer" and "lo" to get "hacerlo"
                                    # On the other, we might just be making a nonsense word (e.g. "hacer" and "el" to get "hacerel")
                                                                        
                                    # So we save our source_word and tag, hoping to combine it with the next word and find a match on
                                    # next iteration
                                    last_word = source_word
                                    last_tag = tag + ' '
                                    check = False
                                    search = False                                    
##                                    if not combine_flag:
##                                        last_word = source_word
##                                        last_tag = tag
##                                        combine_flag = True
##                                    else:
##                                        print('NOT FOUND:'+source_word)                            
                                    
                            else:
                                print('No closed: '+source_word)
                                # Two cases:
                                # 1) This could be a compound word where the open word has no closed word following it                             
                                ## E.g. Our source word is 'hacer' and our corpus text looks like "hacerlo...."
                                ## The open search matched "[hacer]lo" while the closed search matched nothing
                                # 2) This is a partial word matching anywhere in the rest of the corpus and is useless to us
                                ## E.g. FreeLing gave us a strange result like the letter "t", so this is obviously found in an
                                ## open search, but we don't want to consider it part of a combined word or we'll combine something
                                ## like "t" and "tener" to get "ttener", which ruins "tener" for us.
                                
                                # It's impossible to determine which case we have at this point, so instead of deciding,
                                # we can try combining it with the next word and if it's not found, retry with just the next word
                                # on the next iteration of our loop
                                
                                # So we save our source_word and tag, but we don't set the loop sentinel to done=True
                                # When the loop comes through 
                                last_word = source_word
                                last_tag = tag + ' '
                                check = True
                                search = False
##                                
##                                if not combine_flag:
##                                    last_word = source_word
##                                    last_tag = tag
##                                    combine_flag = True
##                                else:
##                                    print('NOT FOUND:'+source_word)                   
                        else:
                            # Our search failed us
                            # If we're in the check state, we want to do a double check for the case where the first part of
                            # a combined word is messing things up, so we crop out the first part and just try the second alone
                            ## E.g. Our source word "ttener" comes in and we're in a check state
                            ## we change our source word to just be 'tener' and try the search again, hoping to get into
                            ## a correct state                           
                            
                            if check:
                                print('Checked: '+source_word)
                                # We know we've at least combined two words, so we try to separate them again and
                                # get the second one
                                source_word = source_word[len(last_word):]
                                tag = tag.split(" ")[1]
                                check = False;
                            else:
                                # If we're not in a check state, and the search doesn't find even the open source word,
                                # it is not in the corpus
                                # We throw up our hands and move on to the next word,
                                print('NOT FOUND:'+source_word)
                                search = False
##                            if combine_flag:
##                                # Try without last_word
##                                source_word = source_word[len(last_word):]
##                                
##                            else:
##                                print('NOT FOUND:'+source_word)
    ##                    if count == 2:
    ##                        print(source_word+' : '+last_word)
                

##            print(replacement_text)
            
            body_soup = BeautifulSoup('<body>'+replacement_text+'</body>', 'xml')
            new_body = body_soup.body            
            text.body.replace_with(new_body)
##            for tag in text.body.find_all(t=re.compile(r'^V.*')):
##                print(tag)
        with open("CorpusCordial_Tagged.xml",'w', encoding='utf-8') as corpus:
            corpus.write(str(soup))
           
            
            
            
         
                            
if __name__ == "__main__":
    main()                                                        
