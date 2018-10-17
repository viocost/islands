#pragma once

class Config{
	public:
		Config();
		string get_vbox();
		string get_vm_name();
		string get_vm_id();

	private:
		string VBOX;
		string VM_NAME;
		string VM_ID;
}
