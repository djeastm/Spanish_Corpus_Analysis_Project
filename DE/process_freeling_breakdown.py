import collections
import operator

def main():
    loaded_file = 'freeling_output.txt'
    # List and count parts of speech (determined by codes from FreeLing)
    with open(loaded_file,encoding='utf8') as fp:
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
                    if code in count_dict:
                        if root in count_dict[code]:
                            count_dict[code][root] = count_dict[code][root]+1
                        else:
                            count_dict[code][root] = 1
                    else:
                        count_dict[code] = {root:1}
        print_to_file("breakdown", count_dict)
        fp.seek(0) # reset to start of file for next code

# Sort and print the given dictionary of terms by frequency
def print_to_file(name, dictionary):    
    with open(name+'.txt','w',encoding='utf8') as name:
        sorted_PoS = sorted(dictionary.items())
        for roots in list(sorted_PoS):
            code = roots[0]
            sorted_roots = sorted(roots[1].items())
            for root in list(sorted_roots):
                name.write(code+" "+root[0]+" ("+str(root[1])+")\n")

## TODO: Parse codes into readable descriptions
def parse_code(code):
    pass

verb_genders = {'F':'feminine',
                'M':'masculine',
                'C':'common'}

verb_nums = {'S':{'singular':verb_genders},
             'P':{'plural':verb_genders}}

verb_persons = {'1':{'1':verb_nums},
                '2':{'2':verb_nums},
                '3':{'3':verb_nums}}
verb_tenses = {'P':{'present':verb_persons},
              'I':{'imperfect':verb_persons},
              'F':{'future':verb_persons},
              'S':{'past':verb_persons},
              'C':{'conditional':verb_persons}}

verb_moods = {'I':{'indicative':verb_tenses},
              'S':{'subjunctive':verb_tenses},
              'M':{'imperative':verb_tenses},
              'P':{'participle':verb_tenses},
              'G':{'gerund':verb_tenses},
              'N':{'infinitive':verb_tenses}}

verb_types = {'M':{'main':verb_moods},
              'A':{'auxiliary':verb_moods},
              'S':{'semiauxiliary':verb_moods}}
PoS_codes = {
    'V':{'verbs':verb_types}, 
    'A':'adjectives',
    'C':'conjunctions',
    'D':'determiners',
    'N':'nouns',
    'P':'pronouns',
    'R':'adverbs',
    'S':'adpositions',
    'Z':'number',
    'W':'date',
    'I':'interjection'
    }

        
if __name__ == "__main__":
    main()
