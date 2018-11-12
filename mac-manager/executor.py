from subprocess import check_output, STDOUT


class ShellExecutor:
    def __init__(self):
        pass

    # Executes arbitrary command and returns its output
    @staticmethod
    def exec(cmd):
        return check_output(cmd, stderr=STDOUT, shell=True).strip().decode('utf8')