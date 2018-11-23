def sizeof_fmt(num, suffix='b'):
    num = int(num)
    for unit in ['','k','m','g','t','p','e','z']:
        if abs(num) < 1024.0:
            return "%3.1f %s%s" % (num, unit, suffix)
        num /= 1024.0
    return "%.1f %s%s" % (num, 'Yi', suffix)