import urllib3 as urllib
import math
import os


class Downloader:
    def __init__(self):
        pass

    @staticmethod
    def get(url, filename=None, dest="~/Downloads/", on_update=None):
        http = urllib.PoolManager()
        response = http.request('GET', url, preload_content=False)
        if response.status != 200:
            print("Download error")
            return
            # Do error handling here
        if not filename:
            filename = url.split("/")[-1]

        dl_path = os.path.expanduser(dest) + filename
        blocksize = 8192 * 192
        filesize = int(response.headers.get('Content-length'))
        downloaded = 0
        progress = 0

        with open(dl_path, 'wb') as out:
            while True:
                data = response.read(blocksize)
                if not data:
                    print("Download complete!")
                    break
                out.write(data)
                downloaded += blocksize
                progress = math.floor(downloaded/(filesize * 0.01))
                if on_update:
                    on_update(progress=progress, downloaded=downloaded, total_size=filesize)





