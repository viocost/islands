#!/bin/python
import os, sys
import argparse
import json


DESCRIPTION="Generate default configuration for Islands"
USAGE="""

"""


def main(*args, **kwargs):
    parser = argparse.ArgumentParser(description=DESCRIPTION, usage=USAGE)
    parser.add_argument('-p', '--dest-path', dest="dest_path")
    args = parser.parse_args()

    if args.dest_path is None:
        print ("No destination path provided. Exiting...")
        sys.exit(1)
    elif not os.path.exists(args.dest_path):
        print ("Destination path does not exist. Exiting...")
        sys.exit(1)


    with open(os.path.join(args.dest_path, "island_conf.json"), "w") as fp:
        json.dump({
            "tor": {
                "torExitPolicy": "reject *:*",
            },
            "data": "",
            "nodeDebugHost": "127.0.0.1",
            "nodeDebugPort": 9229
        }, fp, indent=4)

    print("Config written successfully")


if __name__ == "__main__":
    main()
