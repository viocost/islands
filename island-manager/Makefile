#
# Makefile
# kostia, 2018-10-26 23:51
#

all:
	pyrcc5 forms/resources.qrc -o forms/resources_rc.py
	pyuic5 forms/mainwindow.ui -o forms/main_window_ui_setup.py 
	pyuic5 forms/setup_wizard.ui -o forms/setup_wizard_ui_setup.py
	sed -i '' 's/^import resources_rc/import forms.resources_rc/g' forms/setup_wizard_ui_setup.py
	sed -i '' 's/^import resources_rc/import forms.resources_rc/g' forms/main_window_ui_setup.py
	python3 setup.py py2app -A

clean:
	rm -rf build dist forms/main_window_ui_setup.py forms/setup_wizard_ui_setup.py
	rm -rf resources_rc.py
	rm -rf *.pyc
	
build:
	if [ -f setup.py ]; then
		python3 setup.py py2app
	else
		echo "setup.py not found. Run \"make\" first"
	fi

# vim:ft=make
#
