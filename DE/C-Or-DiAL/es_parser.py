import collections
import operator
import csv

class parser:
    
    def parse(text_to_parse):
        #print(text_to_parse)
        # List and count parts of speech (determined by codes from FreeLing)               
        count_dict = {}
        entry = []            
        for line in text_to_parse.splitlines():
            elements = line.split(" ")                
            if len(elements) >= 4:
                code = elements[0] # the FreeLing code (e.g. AQ0MS0)                
                root = elements[1] # the root word determined by FreeLing
                freq = elements[2].strip() # the frequency count
                text = elements[3] # the source text for this word
                pos = PoS_codes[code[0]]
                
                if pos == 'verb':                       
                    vtype = verb_types[code[1]]
                    mood = verb_moods[code[2]]
                    tense = verb_tenses[code[3]]
                    person = verb_persons[code[4]]
                    num = verb_nums[code[5]]
                    gender = verb_genders[code[6]]                    
                    entry = [text,root,freq,pos,vtype,mood,tense,person,num,gender]
                    
                if pos == 'adjective':
                    atype = adj_types[code[1]]
                    degree = adj_degrees[code[2]]
                    gen = adj_gens[code[3]]
                    num = adj_nums[code[4]]
                    possessorpers = adj_possessorpers[code[5]]
                    possessornum = adj_possessornums[code[6]]
                    entry = [text,root,freq,pos,atype,degree,gen,num,possessorpers,possessornum]

                if pos == 'conjunction':
                    ctype = conj_types[code[1]]
                    entry = [text,root,freq,pos,ctype]

                if pos == 'determiner':
                    dtype = det_types[code[1]]
                    person = det_persons[code[2]]
                    gen = det_gens[code[3]]
                    num = det_nums[code[4]]
                    possessornum = det_possessornums[code[5]]
                    entry = [text,root,freq,pos,dtype,degree,gen,num,possessornum]

                if pos == 'noun':
                    ntype = noun_types[code[1]]                        
                    gen = noun_gens[code[2]]
                    num = noun_nums[code[3]]
                    neclass = noun_neclasses[code[4]]
                    #nesubclass (code[5]) is not used, per documentation)
                    degree = noun_degrees[code[6]]
                    entry = [text,root,freq,pos,ntype,gen,num,neclass,degree]

                if pos == 'pronoun':
                    ptype = pronoun_types[code[1]]                        
                    person = pronoun_persons[code[2]]
                    gen = pronoun_gens[code[3]]
                    num = pronoun_nums[code[4]]
                    case = pronoun_cases[code[5]]
                    entry = [text,root,freq,pos,ptype,person,gen,num,case]

                if pos == 'adverb':
                    adverbtype = adverb_types[code[1]]
                    entry = [text,root,freq,pos,adverbtype]

                if pos == 'adposition':
                    adpostype = adpos_types[code[1]]
                    entry = [text,root,freq,pos,adpostype]

                if pos == 'number':
                    if len(code) > 1:
                        numtype = number_types[code[1]]
                        entry = [text,root,freq,pos,numtype]
                    else:
                        entry = [text,root,freq,pos,'n/a']

                if pos == 'date':
                    entry = [text,root,freq,pos]

                if pos == 'interjection':
                    entry = [text,root,freq,pos]
                    
                with open('breakdown_metadata_'+pos+'.csv','a',encoding='utf8',newline='') as name:
                    writer = csv.writer(name, delimiter=',', quotechar='"')        
                    writer.writerow(entry)              
                 
PoS_codes = {
    'V':'verb', 
    'A':'adjective',
    'C':'conjunction',
    'D':'determiner',
    'N':'noun',
    'P':'pronoun',
    'R':'adverb',
    'S':'adposition',
    'Z':'number',
    'W':'date',
    'I':'interjection',
    'F':'punctuation'
    }


verb_types = {'0':'n/a',
              'M':'main',
              'A':'auxiliary',
              'S':'semiauxiliary'}

verb_moods = {'0':'n/a',
              'I':'indicative',
              'S':'subjunctive',
              'M':'imperative',
              'P':'participle',
              'G':'gerund',
              'N':'infinitive'}

verb_tenses = {'0':'n/a',
               'P':'present',
              'I':'imperfect',
              'F':'future',
              'S':'past',
              'C':'conditional'}

verb_persons = {'0':'n/a',
                '1':'1',
                '2':'2',
                '3':'3'}

verb_nums = {'0':'n/a',
             'S':'singular',
             'P':'plural'}

verb_genders = {'0':'n/a',
                'F':'feminine',
                'M':'masculine',
                'C':'common'}

adj_types = {'0':'n/a',
              'O':'ordinal',
              'Q':'qualificative',
              'P':'possessive'}


adj_degrees = {'0':'n/a',
              'S':'superlative',
              'V':'evaluative'}


adj_gens = {'0':'n/a',
              'F':'feminine',
              'M':'masculine',
              'C':'common'}


adj_nums = {'0':'n/a',
              'S':'singular',
              'P':'plural',
              'N':'invariable'}


adj_possessorpers = {'0':'n/a',
              '1':'1',
              '2':'2',
              '3':'3'}


adj_possessornums = {'0':'n/a',
              'S':'singular',
              'P':'plural',
              'N':'invariable'}

conj_types = {'0':'n/a',
             'C': 'coordinating',
             'S':'subordinating'}

det_types = {'0':'n/a',
             'A':'article',
             'D':'demonstrative',
             'I':'indefinite',
             'P':'possessive',
             'T':'interrogative',
             'E':'exclamative',}

det_persons = {'0':'n/a',
                '1':'1',
                '2':'2',
                '3':'3'}

det_gens = {'0':'n/a',
              'F':'feminine',
              'M':'masculine',
              'C':'common'}

det_nums = {'0':'n/a',
              'S':'singular',
              'P':'plural',
              'N':'invariable'}

det_possessornums = {'0':'n/a',
              'S':'singular',
              'P':'plural',
              'N':'invariable'}

noun_types = {'0':'n/a',
             'C':'common',
             'P':'proper'}

noun_gens = {'0':'n/a',
              'F':'feminine',
              'M':'masculine',
              'C':'common'}

noun_nums = {'0':'n/a',
              'S':'singular',
              'P':'plural',
              'N':'invariable'}

noun_neclasses = {'0':'n/a',
                'S':'person',
                'G':'location',
                'O':'organization',
                'V':'other'}

noun_degrees = {'0':'n/a',
              'V':'evaluative'}

pronoun_types = {'0':'n/a',
             'R':'relative',
             'D':'demonstrative',
             'I':'indefinite',
             'P':'personal',
             'T':'interrogative',
             'E':'exclamative',}

pronoun_persons = {'0':'n/a',
                '1':'1',
                '2':'2',
                '3':'3'}

pronoun_gens = {'0':'n/a',
              'F':'feminine',
              'M':'masculine',
              'C':'common'}

pronoun_nums = {'0':'n/a',
              'S':'singular',
              'P':'plural',
              'N':'invariable'}

pronoun_cases = {'0':'n/a',
                'N':'nominative',
                'A':'accusative',
                'D':'dative',
                'O':'oblique'}

pronoun_polite = {'0':'n/a',
              'P':'yes'}

adverb_types = {'0':'n/a',
               'N':'negative',
               'G':'general'}

adpos_types = {'0':'n/a',
               'P':'preposition'}

number_types = {'0':'n/a',
               'd':'partitive',
               'm':'currency',
               'p':'percentage',
               'u':'unit'}
        
if __name__ == "__main__":
    main()
