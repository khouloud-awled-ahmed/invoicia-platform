import re

with open('src/components/MainLayout.tsx', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Logo subtitle color gray -> purple
content = content.replace(
    'fontSize: \"10px\", color: \"#9ca3af\", margin: 0 }}>',
    'fontSize: \"10px\", color: \"#a78bfa\", margin: 0, fontWeight: \"500\" }}>'
)

# Fix 2: Nav padding
content = content.replace(
    'flex: 1, padding: \"8px\", overflowY: \"auto\"',
    'flex: 1, padding: \"6px 8px\", overflowY: \"auto\"'
)

# Fix 3: User section - add card wrapper + purple email + marginTop auto
content = content.replace(
    'padding: \"12px 14px\", borderTop: \"1px solid #f3f4f6\", background: \"#fafafa\"',
    'padding: \"10px 12px\", borderTop: \"1px solid #f0f0f5\", background: \"#fafafd\", marginTop: \"auto\"'
)
content = content.replace(
    'display: \"flex\", alignItems: \"center\", gap: \"10px\" }}>',
    'display: \"flex\", alignItems: \"center\", gap: \"9px\", padding: \"8px 10px\", borderRadius: \"10px\", background: \"white\", boxShadow: \"0 1px 4px rgba(109,40,217,0.08)\", border: \"1px solid #f0f0f5\" }}>',
    1
)
content = content.replace(
    'fontSize: \"10px\", color: \"#9ca3af\", margin: 0, overflow: \"hidden\", textOverflow: \"ellipsis\", whiteSpace: \"nowrap\"',
    'fontSize: \"10px\", color: \"#a78bfa\", margin: 0, overflow: \"hidden\", textOverflow: \"ellipsis\", whiteSpace: \"nowrap\", fontWeight: \"500\"'
)

with open('src/components/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
