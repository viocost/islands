from views.help_form.help_form import Ui_HelpForm
from PyQt5.QtWidgets import QDialog
import markdown2 as mkd
import logging
log = logging.getLogger(__name__)


class Helpform(QDialog):
    def __init__(self, parent):
        super().__init__(parent)
        self.ui = Ui_HelpForm()
        self.ui.setupUi(self)
        self.content = self.load_help_content()
        self.ui.browser.setText(self.content)


    def load_help_content(self):
        try:
            with open("docs/user_guide.md" , "r" ) as fp:
                text = fp.read()
                style = """<style>
                ul{
                    list-style: none;
                    color: blue;
                    margin: 25px;
                
                }
                
                p {
                    font-size: 16px;
                    max-width: 600px;
                    text-align: justify;
                    line-height: 30px;
                    margin-bottom: 50px;
                    
                }
                </style>
                """
                md =  mkd.markdown(text, extras=["toc"])
                res  =  "%s<h2>Table of content</h2>%s\n<br><br><br><br><br>%s" % (style, md.toc_html, str(md))
                log.debug(res)
                return res

        except Exception as e:
            msg = "Unable to load Use guide content: %s" % str(e)
            log.error(msg)
            return msg

