import os
import pathlib
import re
import shutil
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
WRAPPER = (ROOT / 'deploy-blue-green.sh').read_text()
assert '--copy-dest="$REMOTE_BASE/current/production"' in WRAPPER
assert '--checksum' in WRAPPER


def transfer(source, candidate, baseline):
    return subprocess.run(
        ['rsync', '-az', '--delete', '--checksum', f'--copy-dest={baseline}',
         '--stats', f'{source}/', f'{candidate}/'],
        check=True, capture_output=True, text=True,
        env={**os.environ, 'LC_ALL': 'C'},
    ).stdout


with tempfile.TemporaryDirectory() as directory:
    root = pathlib.Path(directory)
    source, previous, candidate = (root / name for name in ('source', 'previous', 'candidate'))
    for path in (source, previous, candidate):
        path.mkdir()

    payload = os.urandom(1024 * 1024)
    (previous / 'same.bin').write_bytes(payload)
    shutil.copy2(previous / 'same.bin', source / 'same.bin')
    os.utime(source / 'same.bin', (1700000000, 1700000000))
    (previous / 'changed.txt').write_text('prior')
    (source / 'changed.txt').write_text('after')
    shutil.copystat(previous / 'changed.txt', source / 'changed.txt')
    (previous / 'removed.txt').write_text('retain rollback')
    (candidate / 'obsolete.txt').write_text('delete candidate only')
    current = root / 'current'
    current.symlink_to(previous, target_is_directory=True)

    stats = transfer(source, candidate, current)
    size = re.search(r'Total transferred file size: ([\d,]+)', stats)
    assert size and int(size.group(1).replace(',', '')) == 5, stats
    assert (candidate / 'same.bin').read_bytes() == payload
    assert (candidate / 'same.bin').stat().st_ino != (previous / 'same.bin').stat().st_ino
    assert (candidate / 'changed.txt').read_text() == 'after'
    assert (previous / 'changed.txt').read_text() == 'prior'
    assert (previous / 'removed.txt').exists()
    assert not (candidate / 'removed.txt').exists()
    assert not (candidate / 'obsolete.txt').exists()
    (candidate / 'same.bin').write_text('candidate mutation')
    assert (previous / 'same.bin').read_bytes() == payload

    fresh = root / 'fresh'
    fresh.mkdir()
    transfer(source, fresh, root / 'missing')
    assert (fresh / 'same.bin').read_bytes() == payload
    assert (fresh / 'changed.txt').read_text() == 'after'
