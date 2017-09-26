import collections
import operator

def main():
    loaded_file = 'freeling_output.txt'
    # List and count parts of speech (determined by codes from FreeLing)
    with open(loaded_file,encoding='utf8') as fp: 
        codes = {'verbs': 'V',
                 'adjectives': 'A',
                 'conjunctions': 'C',
                 'determiners': 'D',
                 'nouns': 'N',
                 'pronouns': 'P',
                 'adverbs': 'R',
                 'adpositions': 'S',
                 'number':'Z',
                 'date':'W',
                 'interjection':'I'}

        # Process verbs
        process_verbs(fp)
        
        # Loop through code types and output files with counts
        for k, v in codes.items():
            print(k+" "+v)                            
            count_dict = {}
            for line in fp:
                elements = line.split(" ")                
                if len(elements) >= 3:
                    #word = elements[0] # the actual word in the raw text
                    root = elements[1] # the root word determined by FreeLing
                    code = elements[2] # the FreeLing code (e.g. AQ0MS0)
                    confidence = elements[3]
                    # Each analyzed term has a confidence attached
                    # Chose .25 as floor, but can be changed if necessary
                    if float(confidence.strip()) >= 0.25:
                        if code[0] == v:
                            if root in count_dict:
                                count_dict[root] = count_dict[root]+1
                            else:
                                count_dict[root] = 1                                
            print_to_file(k, count_dict)
            fp.seek(0) # reset to start of file for next code

# Sort and print the given dictionary of terms by frequency
def print_to_file(name, dictionary):    
    with open(name+'.txt','w',encoding='utf8') as name:
        sorted_PoS = sorted(dictionary.items(), key=operator.itemgetter(1))
        for string in list(reversed(sorted_PoS)):                
            name.write(str(string[0]+" ("+str(string[1])+")\n"))
        
if __name__ == "__main__":
    main()
