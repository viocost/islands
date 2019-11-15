Title: Islands Software Manual  
Author: Limitless Knowledge Association  

# 1 - Introduction #
## 1.1 - What is Islands? ##
Islands is a decentralized network built on the principles of anonymity, verifiability and user ownership, which serves as a platform for communication apps.
That’s a mouthful. Breaking it down, Islands is:* Decentralized: No single person or entity can ever control Islands. The default distribution of Islands comes with the tools to host an Island and grow the system.
* Anonymous: Islands does not collect any personally identifiable data from users. All communication is encrypted and routed through TOR to obscure the source and destination.
* Verifiable: Although users on Islands are anonymous, they do have an identity in the system, with means to ensure that their identity can not be faked by another person.
* Respectful of user ownership: When a user launches an Island and runs an app on it, they have full control of what’s on it and who can access it.
* A platform for communication apps: Islands is fully open-source and can be used by anyone who wishes to build applications with the above features. The default app shipping with Islands is Islands Chat.


## 2.2 - Philosophy Overview ##
### 1.1 - What Islands Does ###
Islands is built to exist outside the control of any single entity, whether that be a person, a company or a nation-state. Each user of Islands can run their own Island and contribute to the system. An attack on any single node on the system will not take the system down. Finding all the nodes will be difficult (since network traffic is encrypted and routed through TOR anonymizers) and becomes increasingly difficult with more people running Islands nodes.
It’s unwise to use phrases like “completely secure” or “unhackable” to describe any computer system, but Islands strives to make it as difficult as humanly possible while still allowing users to connect with each other.
(For people who are unable to run their own nodes, such as mobile users, an Island owner may set up a “guest service” which lets outside users connect to their Island through TOR. This is best limited to small numbers of guest users, as concentrating many guests on one Island creates a centralized point to attack. This feature is described in [Guest Services][].)
### 1.2 - What Islands Won't Do ###
Security requires trade-offs. The core developers of Islands are determined not to implement any feature which could leak information about a user. Taking Islands Chat as an example, that means some convenient features standard to other chat apps, such as showing a user’s online status, are intentionally left out. <Expand this with more examples>
### 1.3 - What Islands Might Do In The Future ###
At launch, Islands comes bundled with a single application, Islands Chat. In the future, these are other features and apps the Island team is interested in having:* Whiteboard and screen-sharing capability (probably integrated in Islands Chat)
* Decentralized multiplayer text worlds in the vein of a MUD/MUSH/MUCK where anyone can hook their spaces into the world (or deny others the ability to link to their space) without admin intervention.
* A publishing platform that would have similar features to social network apps like Twitter and Facebook without the privacy issues.
* Tools that support software development, such as the ability to host a Git repository in Islands and push update notices to users.


The Islands team makes no promises that any of these things will happen, but they represent a sample of things that Islands will make possible.
### 1.4 - Why Use Islands? ###
The trade-offs inherent in the Islands design mean that some people will be turned off of wanting to use it. The Islands team believe that this is an acceptable trade-off. (Some “missing” features that don’t constitute security risks are simply missing because they don’t fit with available time and current priorities. Those will get addressed or not as time and priorities allow.)
If you want your content to be broadcast to the widest audience possible, you are going to be better off using conventional internet platforms.
For someone with a group of family or friends they would like to talk with, setting them up with Islands takes more work than downloading Skype or signing up on Facebook. However, in return for that effort, they are guaranteed an environment where:* Their conversation won’t be analysed by corporate algorithms looking to sell you product and ideas.
* Their logs can’t be subpoenaed by governments, if the government can even find who to send the subpoena to.
* Their content won’t get taken down by enforcement bots being abused by trolls or copyright owners.
* Only the people who the island owner wants to expose info to will see it.


For a person living in a free country, these are nice benefits. For someone living under oppression (for example, pro-democracy protesters in Hong Kong in 2019), these things could be a matter of speech or silence, freedom or imprisonment, life or death.
This begs the question: can bad actors exploit Islands? Yes, just like with any encrypted system directed at evading surveillance or detection. Can Islands stop them? No, and the Islands team does not intend to try. However, Islands will give you the tools to keep bad actors out of your space. Technology is like a weapon: a knife or a gun sitting on a table is just an inert piece of metal until someone picks it up and uses it for good or ill. ![][legal_hacks]
XKCD #504 “Legal Hacks”, © Randal Monroe, CC-BY-NC
## 3.3 - Technical Overview ##
### 1.1 - Islands Manager ###
Islands Manager is a graphical desktop tool for downloading and managing the Islands software and the cryptographic keys that establish a user’s identity in Islands. For the Islands launch in 2019, Islands Manager is fully supported for Windows and Mac OSX and supported with some caveats on Linux.
On Windows and Mac, Islands Manager will download and install [VirtualBox](https://www.virtualbox.org/) to host the Island server. On Linux, Islands Manager will run the Island natively within a Python virtual environment.
Islands Manager contains a built-in, bare-bones [BitTorrent](https://en.wikipedia.org/wiki/BitTorrent) client to download the Island software. It will share the Islands download files with other peers as long as you permit it, which we encourage.
Islands Manager is used to start, stop and monitor the local Island server.
Users interested in hosting an Island on a Linux server without a GUI manager should consult [Advanced Topics: Hosting an Island on a Remote Server](Hosting_an_Island_on_a_Remote_).
### 1.2 - Distributed Server ###
The Islands server runs on Linux (inside a virtual machine within Windows and Mac). The main components are:* The Island itself. The Island handles user authentication, data encryption and any client apps running on it.
* A TOR Onion Router. TOR handles the transmission of Islands data over the internet so that it remains anonymous. It allows for the creation of “onion links” which will let you or others access your Island remotely through the TOR Browser without having to track or share any IP addresses. The onion router also contributes to the TOR network (and therefore the Islands network) by routing outside data where it needs to go. This routing is invisible to the average Islands user.
* A web server. The user functions of Islands are served as web pages. (Where the Islands server is contained in a VM, this is done over a host-only network that only your computer can access.)


### 1.3 - Client Apps ###
Client applications are what the user will do the most work in. Apps are accessible via a standard web browser on the local network or through the TOR Browser for remote connections. In the future, Islands may also provide client services by means other than the web server.
The core implementation of Islands ships with Islands Chat. Islands Chat allows users to set up chat topics and invite other Islands users to participate, while being as anonymous as they wish to be.
### 1.4 - System Requirements ###
#### 1.4.1 - Desktop Operating Systems ####* A 64-bit Operating System (Windows, macOS or Linux)

* Minimum Windows version supported: Windows 8. 1
* Minimum macOS version supported: 10.12 (Sierra).
* Minimum Linux requirements: An x86-64 distribution able to run Python 3.7 and virtual environments. 2
* At least 8 GB of system RAM
* At least 10 GB 3 of free hard disk
* A stable internet connection. 4



To connect to a remote Island hosted on another computer, you need the [TOR Browser](https://www.torproject.org/download/).
                                                                                                    
1. As of 2019, Islands does run on Windows 7. Microsoft’s support for Windows 7 ends in January 2020, so it’s not feasible to promise support for software on it. Use Windows 7 at your own risk.
2. Other UNIX Platforms and other processor architectures are not currently supported. We invite people interested in those platforms to contribute to the project.
3. The virtual machine disk for Islands has a max size of 8GB. It will initially take up less space but will grow over time because of log files.
4. Running Islands from a portable laptop is possible but not ideal. You may need to restart an Island that has hung after being subjected to multiple sleep/hibernation states and connection drops.


#### 1.4.2 - Mobile Devices ####
For iOS and Android, you need the TOR Browser to be able to connect to Islands services. Info about obtaining the TOR Browser can be found on the [TOR Project website](https://www.torproject.org/download/).
Hosting an Islands server on a mobile phone or tablet is not supported.
#### 1.4.3 - Dedicated Server Hosting ####
TODO
## 4.4 - Project Credits and Licences ##
### 1.1 - Limitless Knowledge Association ###
Limitless Knowledge Association is a non-profit corporation founded and run by Brian Jones, a veteran of software development since 1983. Work done under the Limitless banner promotes free expression, literacy and critical thinking. Its oldest and longest-standing project has been hosting text-based role-playing worlds (MUCKs) catering to teens, giving them opportunities to build and manage their own spaces.
### 1.2 - The Islands Team ###
The core group of people developing Islands are:* Brian Jones - specification design, bankroll
* Rybakov Konstantin - lead programmer
* David Holz - programmer
* Jamie Brewer - documentation, testing
* Andy Smith - testing


### 1.3 - MIT Licence ###
Copyright 2019, Limitless Knowledge Association

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
### 1.4 - Third-Party Software Credits ###
#### 1.4.1 - Islands Manager ####
Islands Manager uses Qt and Qt Creator for it’s graphical interface. Islands uses Qt under the [GNU Public License v3](https://opensource.org/licenses/GPL-3.0) and the [GNU Lesser Public License v3](https://opensource.org/licenses/lgpl-3.0.html). Compliance with these licenses is required to use Qt without a commercial license. For more information, see the [Qt guide to open source usage](https://www.qt.io/download-open-source).
#### 1.4.2 - Islands Server ####
#### 1.4.3 - Islands Chat ####
# 2 - Running An Island #
## 5.5 - Windows and Mac OSX: Islands Manager ##
### 2.1 - What is Islands Manager? ###
### 2.2 - Obtaining and Installing Islands Manager ###
### 2.3 - Starting a New Island ###
### 2.4 - Stopping and Restarting an Island ###
### 2.5 - Updating the Islands Software ###
### 2.6 - Islands Manager Interface Guide ###
#### 2.6.1 - Main Screen ####
#### 2.6.2 - System Tray Icon ####
#### 2.6.3 - "Menu" Menu ####
#### 2.6.4 - Tools Menu ####




#### 2.6.5 - Keys Menu ####




#### 2.6.6 - Config Menu ####






#### 2.6.7 - Help Menu ####
## 6.6 - Linux Desktop: Islands Manager ##
### 2.1 - Obtaining and Installing Islands ###
### 2.2 - Starting a New Island ###
### 2.3 - Updating the Islands Software ###
## 7.7 - Islands Admin ##
### 2.1 - First-Time Island Configuration ###
### 2.2 - Islands Admin Web Panel ###
#### 2.2.1 - Hidden Services ####




#### 2.2.2 - Log Viewer ####
## 8.8 - Advanced Topics ##
The preceding sections will be enough detail for most users to get going with Islands. The following sections are for advanced users who want to go beyond the default setup, manually tweak settings and/or host an Island elsewhere besides their desktop.
### 2.1 - Logging Into an Island Remotelely via TOR ###
### 2.2 - Enabling SSH Access to an Islands VM ###
### 2.3 - Hosting an Island on a Remote Server ###
### 2.4 - Managing the Islands VM from VirtualBox ###
### 2.5 - Islands Image Authoring ###
# 3 - Islands Chat #
## 9.9 - The Vault ##
### 3.1 - Logging In ###
### 3.2 - Create a New Chat Topic ###
### 3.3 - Joining a New Chat Topic ###
### 3.4 - Logging In to a Saved Chat Topic ###
### 3.5 - Managing Chat Topics ###
## 10.10 - Islands Chat Client ##
### 3.1 - Using the Chat ###
#### 3.1.1 - Interface Guide ####
#### 3.1.2 - Chat Commands ####
#### 3.1.3 - Identity Management ####




### 3.2 - Managing a Chat Topic ###
#### 3.2.1 - Inviting New People ####
#### 3.2.2 - Managing Current Participants ####
### 3.3 - Islands Chat on Mobile Devices ###
# 4 - Islands Technical and Development Guide #
## 11.11 - Islands Philosophy In-Depth ##
### 4.1 - "No Motherships" ###
### 4.2 - Anonymity First ###
### 4.3 - Identity Verification ###
### 4.4 - Ownership ###
## 12.12 - Developing for Islands ##
### 4.1 - Obtaining the Git Repository ###
### 4.2 - Dependencies ###
Each Islands component has its own set of dependencies and the files needed to pull them down from the relevant repositories (pip for Python and npm for Javascript). There are also be some tools that you may need to obtain separately. The following lists lay out what these dependencies are and links to their documentation pages. The details of how to set them up to develop for Islands are found here: [4.3 - Setting Up a Development Environment](Setting_Up_a_Development_Envir).
#### 4.2.1 - Islands Server ####
#### 4.2.2 - Islands Manager ####
Islands manager currently depends on [Python 3.7.x](https://docs.python.org/release/3.7.5/) The dependency versions specified in the requirements.txt file may produce errors if you try to use them with an unsupported Python version. 
Islands Manager uses these third-party libraries from the pip repository:* asn1crypto
[asn1crypto](https://pypi.org/project/asn1crypto/)* certifi
[certifi](https://pypi.org/project/certifi/)* cffi
[cffi](https://cffi.readthedocs.io/en/latest/)* cryptography
[cryptography](https://cryptography.io/en/latest/)* pycparser
[pycparser](https://pypi.org/project/pycparser/)* PyQt5
[PyQt5](https://pypi.org/project/PyQt5/)* PyQt5-sip
[PyQt5-sip](https://www.riverbankcomputing.com/software/sip/intro)* six
[six](https://six.readthedocs.io/)* urllib3
[urllib3](https://urllib3.readthedocs.io/en/latest/)* markdown2
[markdown2](https://github.com/trentm/python-markdown2/wiki)* fasteners
[fasteners](https://fasteners.readthedocs.io/en/latest/)* pywin32

[pywin32](http://timgolden.me.uk/pywin32-docs/)

Some of the above dependencies interface with C++ components and require a C++ compiler to be installed on the development system. Covering all possible cases for compiling C++ is outside the scope of this document. Setup instructions for those that we have successfully used are detailed under the OS-specific sections of [Setting Up a Development Environment: Islands Manager](Islands_Manager-3).
In addition, Islands Manager depends on [libtorrent](http://libtorrent.org/python_binding.html). Pre-compiled libtorrent libraries for each supported OS can be found under `lib/vendor/<os>`. Should you need to rebuild those libraries for any reason, downloads and documentation can be found on the libtorrent website.
The graphical interface for Islands Manager is built with [Qt](https://doc.qt.io/). The Islands Team has opted to use [Qt Creator](https://doc.qt.io/qtcreator/index.html) as a tool for building the UI. This is explained in more detail here: [Islands Manager: Qt UI Tools][Qt UI Tools].
#### 4.2.3 - Islands Applications ####
### 4.3 - Setting Up a Development Environment ###
#### 4.3.1 - Islands Server ####
#### 4.3.2 - Islands Manager ####

[Qt](https://www.qt.io) is a popular, cross-platform, open-source tool kit for building graphical user interfaces. Qt offers both a free license for open-source users and a paid license for commercial users. 

A Note On Qt Licensing in Islands
The Islands project is offered as free and open source under the MIT license. The MIT license does not require derivative projects to remain open source. Qt is licensed under the GPLv3 and LGPLv3, which does require all derivative projects to remain open source. The Islands Team intends to remain compliant with Qt’s open source licensing where Qt is used. It is up to other developers to either ensure they remain compliant with the open source license or purchase at Qt commercial license. This manual will assume use of open source licenses and tools.

Downloading and Installing Qt Development Tools1. Visit https://www.qt.io/download-qt-installer which should detect your operating system and offer you the appropriate version of the Qt installer. Select and download the version you need.
<https://www.qt.io/download-qt-installer>2. Run the installer and follow the prompts. You will be asked to either supply or create a Qt Account so that the installer can provide the products available to your chosen license. You will also be asked to accept or decline the collection of anonymous statistics.
3. The installer will let you select from many items to install. You do not need all of them. (You may select all of them if you like, and have many gigabytes of free disk space.) At minimum, select:
4. From a stable version of Qt (current version in Islands as of November 2019: 5.12.2):
5. A binary package corresponding to your preferred compiler setup (i.e. gcc, MSVC)
6. The Sources package.
7. All of the Qt API packages (Islands won’t use all of them but it’s easier and they don’t take up much disk space.)
8. The Qt Debug Information Files
9. From Developer and Designer Tools:
10. Qt Creator
11. Qt Creator Debugger Support
12. Debugging tools for your operating system.
13. Proceed with the download and install. Do other things until it’s done.

![][Qt-Setup]

TODO

TODO

`cffi` on Windows requires seperate installation of a C++ compiler (they reccomend Microsoft’s) and libraries from the Windows SDK. When installing dependencies from pip, cffi will throw an error and terminate installation if it does not find them. Refer to <https://wiki.python.org/moin/WindowsCompilers> and [the cffi docs](https://cffi.readthedocs.io/en/latest/installation.html#platform-specific-instructions) for an overview of the subject.
To install Microsoft’s C++ compiler and libraries if you don’t already have them:1. Visit https://visualstudio.microsoft.com/downloads/
<https://visualstudio.microsoft.com/downloads/>2. Browse to “Tools for Visual Studio” (2019 as of this writing). From the drop-down, find “Build Tools for Visual Studio” and download the installer from the link (`vs_BuildTools.exe`).
![][VisualStudioBuildToolsDownload]3. Run the installer, click “Continue” and wait for the installer to run its preliminary setup.
4. The installer will allow you to select only the components you need. Select “Individual Components” from the tabs along the top.
5. In the search box, type “MSVC” (which stands for MicroSoft Visual C). Select the checkbox for the most recent version of the build tools for your platform. (For example: “`MSVC v142 - VS 2019 C++ x64/x86 build tools (v14.23)`” will install version 14.23 of the tools for x64/x86 platforms.) The minimum supported version is 14.0.
6. In the search box, type “Windows”, scroll down to “SDKs, Libraries and Frameworks” and select the checkbox for the most recent version of the Windows SDK. (With Visual Studio 2019, this will be the Windows 10 SDK, even if your system isn’t Windows 10).
7. Click “Install” in the bottom-right and wait for the components to download and install.


If you need to add, change or remove components, you can run the Visual Studio installer again and select “Modify” from the “Visual Studio Build Tools” options.![][VisualStudioMSVCInstaller]

Building the Virtual Environment
Once you have installed all external dependencies, you should be able to build a new virtual environment within the Git repository.* Open a command prompt and `cd` to the `island-manager` directory.
* Run: `python -m venv env` to create the virtual environment directory.
* Run `.\env\Scripts\activate.bat` to enable the virtual environment.
* Install dependencies by running `pip install -r requirements.txt` .
* Run `main.py` to run and test Islands Manager.
* If you wish to use IDLE (the default Python IDE) with the virtual environment, invoke it from the command line with `python -m idlelib.idle `while within the virtual environment. For other editors, consult their documentation.



A Note on Cryptography and OpenSSL
Islands Manager itself does not use SSL for any of its functions. However, the cryptography module includes support for OpenSSL alongside many other cryptographic methods. The pre-compiled packages from pip include static-linked OpenSSL libraries. However, if there is no pre-compiled binary of cryptography for the active version of Python, pip will attempt to compile it. Compiling cryptography requires OpenSSL to be available on the system. This is likely to fail on Windows, which does not come with OpenSSL installed by default, unlike most UNIX and macOS systems.
The preferred solution is to stick with a [cryptography version](https://pypi.org/project/cryptography/#history) that has pre-built support for the active Python version. The version specified in `requirements.txt` should meet this requirement. If you hit this error, check that you are building your virtual environment with a supported Python version. 
If for some reason you absolutely must build your own cryptography package, the process is covered in the [cryptography docs](https://cryptography.io/en/latest/installation/#building-cryptography-on-windows). Source downloads for OpenSSL are available [here](https://www.openssl.org/source/). There are no official Windows binaries for OpenSSL but an approved list of third-party binaries is maintained [here](https://wiki.openssl.org/index.php/Binaries).
#### 4.3.3 - Islands Applications ####
## 13.13 - Forking Islands ##
### 4.1 - Signing Your Builds ###
## 14.14 - Distributing Islands ##
## 15.15 - Islands and Islands Chat Changelog History ##
# 5 - Table of Contents #


[legal_hacks]: legal_hacks.png width=740px height=242px

[Qt-Setup]: Qt-Setup.png width=876px height=568px

[VisualStudioBuildToolsDownload]: VisualStudioBuildToolsDownload.png width=830px height=561px

[VisualStudioMSVCInstaller]: VisualStudioMSVCInstaller.png width=800px height=446px