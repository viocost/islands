import asyncio
from subprocess import check_output, STDOUT
from multiprocessing import Process
from time import sleep


class ShellExecutor:

    def __init__(self):
        raise IllegalStateException("ShellExecutor cannot be initialized")

    @staticmethod
    def __execute(cmd, stdout_cb, stderr_cb):
        loop = asyncio.get_event_loop()
        rc = loop.run_until_complete(
            ShellExecutor._stream_subprocess(
                cmd,
                stdout_cb,
                stderr_cb,
            ))

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
    def exec_sync(cmd, verbose=True):
        stdout = []
        stderr = []

        def on_data(data):
            stdout.append(data)
            if verbose:
                print("==DATA: %s" % data)

        def on_error(data):
            stderr.append(data)
            if verbose:
                print("==ERROR: %s" % data)

        res = ShellExecutor.__execute(cmd, on_data, on_error)
        if verbose:
            print("==RETURN CODE: %d" % res)
        stdout = "".join(stdout)
        stderr = "".join(stderr)
        return res, stdout, stderr



class IllegalStateException(Exception):
    pass