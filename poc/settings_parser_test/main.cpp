#include "rapidjson/document.h"
#include "rapidjson/writer.h"
#include "rapidjson/stringbuffer.h"
#include "rapidjson/filereadstream.h"
#include "rapidjson/filewritestream.h"
#include <cstdio>
#include <iostream>

using namespace std;

void write_settings(rapidjson::Document * d){
	FILE* fp = fopen("config.json", "wb");
	char writeBuffer[65536];
	rapidjson::FileWriteStream os (fp, writeBuffer, sizeof(writeBuffer));
	rapidjson::Writer<rapidjson::FileWriteStream> writer(os);
	(*d).Accept(writer);
    fclose(fp);	
}

void add_member(rapidjson::Document *d, string k, string v){
		rapidjson::Value val;
		rapidjson::Value key;
		const char* bv = v.c_str();
		const char* bk = k.c_str();
		val.SetString(rapidjson::StringRef(v.c_str()));
		key.SetString(rapidjson::StringRef(k.c_str()));
		d->AddMember(key, val, d->GetAllocator());
}


rapidjson::Document * read_document(){
	FILE* fp = fopen("config.json", "r");
	char readBuffer[65536];
	rapidjson::FileReadStream is(fp, readBuffer, sizeof(readBuffer));
	rapidjson::Document * d = new rapidjson::Document();
	d->ParseStream(is);
	d->SetObject();
	return d;
}

int main() {
	rapidjson::Document *d = read_document();
	add_member(d, "key", "meow");
	cout<<(*d)["key"].GetString()<<endl;
	try{
		cout<<d->HasMember("dfkgfg")<<endl;
		cout<<(*d)["kasdfey"].GetString()<<endl;

	}catch(errc){
		cout<<"EEEERRRR";
	}

	write_settings(d);
	return 0;
}
