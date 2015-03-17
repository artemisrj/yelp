'save the main info to db(frequency word and the review about it)'
 # -*- coding: UTF-8 -*-  
import json
import sqlite3
from pattern.en import parsetree,singularize,sentiment,positive,mood,modality
import pdb
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

review_bui="wZwZcte4lcbu51NOzCjWbQ"
path="F:/data/yelp/"+review_bui+"_l.json"
cx=sqlite3.connect("D:/database3.db")

rc=0  
cnum=4
dsum=[]
alllist=[]#列表，句子长度，每个里面是句子里面的名词
falllist=[]#list,有效句子长度，每个里面是 句子里面的名词
allDic={}
classifyDic={}
sen_wordDic={}
dicWord={}  #整个词汇表

def checkword(x):
    if x=="i":
        return False
    else:
        return True

def c2nn(x): #函数输入chunk 输出chunk中的名词或者名词词组
    a=[]
    ss=""
    #print chunk.string
    for word in x:
        if str(word.type)[0]=="N" and checkword(word.string):
            if ss=="":
                ss=singularize(word.string)
            else:
                ss=ss+" "+singularize(word.string)
        else:
            if ss!="":
                a.append(ss)
                ss=""
       # print word.string+" "+word.type
    if ss!="":
        a.append(ss)
    #print a
    return a
class AReview(object):
    pass
    
class textcontent(object):
    pass
    
def judge(str,loc):
    while True:
        if str[loc]=='<':
            return False
        if str[loc]=='>':
            return True
        loc=loc-1
        #print loc
        if loc==-1:
            return True
            
cur=cx.cursor()  
cur.execute('create table wZwZcte4lcbu51NOzCjWbQ(date Date,userid varchar(30),words text,stars int,texts text)') 
for line in open(path):
    rec=json.loads(line)
    aa=rec['text']
    v=AReview()
    v.date=rec['date']
    v.user=rec['user_id']
    v.nouns=''
    v.stars=rec['stars']
    v.texts=''
    aa=aa.replace('\n','\n <br> \n')
    
   # print aa
   # pdb.set_trace()
    s=parsetree(aa,relations=True,lemmata=True)
    #print "s" 
    for sentence in s:
        c=''
        c=str(sentence.string)
        print "sentence"
        joinlist=[]
        for chunk in sentence.chunks:
            
            if chunk.type=="NP":
                tword=c2nn(chunk)
                #print tword
                joinlist.extend(tword)
                #print tword
                for ww in tword:
                    ww=ww.lower()
                    if ww=='<br>':
                        continue
                    if v.nouns=='':
                        v.nouns=ww
                    else:
                        v.nouns=v.nouns+','+ww            
                    index=c.lower().find(ww)
                    
                    if index>=0 and judge(c,index) :
                        c=c[:index+len(ww)]+'</span>'+c[index+len(ww):]
                        c=c[:index]+'<span class=*'+ww+'* >'+c[index:]

                for nn in tword:
                    if nn in dicWord:
                        dicWord[nn]=dicWord[nn]+1
                    else :
                        dicWord[nn]=1
            else:
                for w in chunk:
                    if w.type=="JJ":
                       index=c.lower().find(w.string)
                       
                       print index
                      
                       print w
                       if index>0 and judge(c,index):
                            c=c[:index+len(w.string)]+'</span>'+c[index+len(w.string):]
                            c=c[:index]+'<span class=*JJ* >'+c[index:]
                       
                       #print c

        c='<span class=*sentence* sentiment=*'+str(sentiment(sentence))+'* positive=*'+str(positive(sentence))+'* mood=*'+str(mood(sentence))+'* modality=*'+str(modality(sentence))+'*>'+c+"</span>"
        c=c.replace('"','*')
        v.texts=v.texts+c
        #print c
        #pdb.set_trace()
        #print v.texts            
        
    print v.date
    #print v.nouns
    #print v.texts
    print v.stars
    
    cur.execute('insert into wZwZcte4lcbu51NOzCjWbQ values("'+v.date+'","'+v.user+'","'+v.nouns+'","'+str(v.stars)+'" ,"'+v.texts+'")')
#cur.execute('create table wordfre(word varchar(20) UNIQUE,uid integer)')
cur.close()    
cx.commit()
cx.close()   
pdb.set_trace()

thefinalwords=sorted(dicWord.iteritems(),key=lambda d:d[1],reverse=True)[:50]
for each in thefinalwords:
    #print each[0]
    #print 'insert into wordfre values("'+each[0]+'",'+str(each[1])+')'
    cur.execute('insert into wordfre values("'+each[0]+'",'+str(each[1])+')')


# store the related review 
cur.execute('create table review_link(word varchar(20) UNIQUE,rlink text NULL)')

for fword in thefinalwords:
    id=0
    indexes=[]
    for line in open(path):      
        rec=json.loads(line)
        aa=rec['text'].lower()
        if not aa.find(fword[0])==-1:
            indexes.append(id)
        id+=1
    
    #print 'insert into review_link("'+fword[0]+'","'+str(indexes)+'")'
    cur.execute('insert into review_link values("'+fword[0]+'","'+str(indexes)+'")')
    cur.execute
cur.close()    
cx.commit()
cx.close()   