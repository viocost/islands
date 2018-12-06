import asyncio
from  subprocess import Popen, PIPE, run
from multiprocessing import Process

import io
import sys
from time import sleep
from threading import Thread


class ShellExecutor:

    def __init__(self):
        raise IllegalStateException("ShellExecutor cannot be initialized")

    @staticmethod
    def __execute(cmd, stdout_cb, stderr_cb):
        loop = None
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            asyncio.get_child_watcher().attach_loop(loop)
        rc = loop.run_until_complete(
            ShellExecutor._stream_subprocess(
                cmd,
                stdout_cb,
                stderr_cb,
            ))
        print("Complete executing command. Returning from __execute")
        return rc

    @staticmethod
    async def _stream_subprocess(cmd, stdout_cb, stderr_cb):
        process = await asyncio.create_subprocess_shell(cmd,
                                                        stderr=asyncio.subprocess.PIPE,
                                                        stdout=asyncio.subprocess.PIPE)
        await asyncio.wait([
            ShellExecutor._read_stream(process.stdout, stdout_cb),
            ShellExecutor._read_stream(process.stderr, stderr_cb)
        ])
        print("Waiting for process.")
        return await process.wait()

    @staticmethod
    async def _read_stream(stream, cb):
        while True:
            line = await stream.readline()
            if line:
                cb(line.decode('utf8'))
            else:
                break



    @staticmethod
    def exec(cmd, on_data, on_error, on_done):
        def runner():
            res = ShellExecutor.__execute(cmd, on_data, on_error)
            on_done(res)
        p = Process(target=runner, group=None)
        p.start()



    @staticmethod
    def exec_sync(cmd, verbose=False):
        if sys.platform == 'darwin':
            return ShellExecutor.exec_sync_mac(cmd, verbose)
        elif sys.platform == 'win32':
            return ShellExecutor.exec_sync_win(cmd, verbose)


    @staticmethod
    def exec_sync_win(cmd, verbose=False):
        proc = run(cmd, shell=True, encoding='cp866', stdout=PIPE, stderr=PIPE, bufsize=1)
        if verbose:
            print("RETURN CODE: %d" % proc.returncode)
            print("STDOUT: %s" % proc.stdout)
            print("STDERR: %s" % proc.stderr)
        return proc.returncode, proc.stdout, proc.stderr


    @staticmethod
    def exec_sync_mac(cmd, verbose=False):
        out = ""
        err = ""
        res = None
        proc = Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE, bufsize=1, universal_newlines=True)
        while proc.poll() is None:
            for line in proc.stderr:
                err += line
                if verbose:
                    print("STDERR: " + line)
            for line in proc.stdout:
                out += line
                if verbose:
                    print("STDOUT: " + line)
        res = proc.returncode
        return res, out, err


    @staticmethod
    def exec_stream(cmd, on_data, on_error, verbose=False):
        res = None
        proc = Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE, errors='ignore', bufsize=1, universal_newlines=True)
        while proc.poll() is None:
            for line in proc.stdout:
                on_data(line)
                if verbose:
                    print("STDOUT: " + line)
            for line in proc.stderr:
                on_error(line)
                if verbose:
                    print("STDERR: " + line)
        res = proc.returncode
        return res, proc.stdout, proc.stderr


class IllegalStateException(Exception):
    pass
