import os
OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbGFhYnJxZmp0dmJ0YnZvYWljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMzODEzMywiZXhwIjoyMDYyOTE0MTMzfQ.BEq1sbAj87kbPAb8a6yPBvx2N7_GxPgye2fQSkCdEbY'
NEW_KEY = 'sb_secret_91nbyjNN23_30hYuUXeyNQ_60A4zdiF'
env = open('.env.local').read()
env = env.replace(OLD_KEY, NEW_KEY)
open('.env.local', 'w').write(env)
print('Updated .env.local')
files = ['app/api/oracle/route.ts','app/api/superadmin/route.ts','app/api/admin/route.ts','app/api/register/route.ts','app/api/inscription/route.ts','app/api/battles/route.ts','app/api/oracle-fill/route.ts','app/api/predictions/route.ts']
for f in files:
    if os.path.exists(f):
        content = open(f).read()
        if OLD_KEY in content:
            content = content.replace(OLD_KEY, NEW_KEY)
            open(f, 'w').write(content)
            print('Updated:', f)
print('Done')
