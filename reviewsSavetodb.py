'save the main info to db(frequency word and the review about it)'
import json
import sqlite3
from pattern.en import parsetree,singularize
import pdb

review_bui="y8VQQO_WkYNjSLcq6hyjPA"
path="F:/data/yelp/"+review_bui+"_l.json"
cx=sqlite3.connect("D:/database2.db")

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
    
cur=cx.cursor()  
cur.execute('create table reviewsnouns(date Date,userid varchar(30),words text)')  
for line in open(path):
    rec=json.loads(line)
    aa=rec['text'].lower()
    v=AReview()
    v.date=rec['date'];
    v.user=rec['user_id']
    v.nouns=''
    ss=aa.split(".")
    rc=rc+1 #第几个评论 评论从1开始计数
    sc=0

    for item in ss:
        sc=sc+1
        s=parsetree(item,relations=True,lemmata=True)
        #print item
        for sentence in s:
            joinlist=[]
            for chunk in sentence.chunks:
                if chunk.type=="NP":
                    tword=c2nn(chunk)
                    #print tword
                    joinlist.extend(tword)
                    print tword
                    for ww in tword:
                        if v.nouns=='':
                            v.nouns=ww
                        else:
                            v.nouns=v.nouns+','+ww
                    for nn in tword:
                        if nn in dicWord:
                            dicWord[nn]=dicWord[nn]+1
                        else :
                            dicWord[nn]=1
    print v.date
    print v.nouns
    cur.execute('insert into reviewsnouns values("'+v.date+'","'+v.user+'","'+v.nouns+'")')
    

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
    #print indexes
    #print 'insert into review_link("'+fword[0]+'","'+str(indexes)+'")'
    cur.execute('insert into review_link values("'+fword[0]+'","'+str(indexes)+'")')
    cur.execute
cur.close()    
cx.commit()
cx.close()   