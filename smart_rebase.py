import sys
import os

def main():
    filepath = sys.argv[1]
    with open(filepath, 'r') as f:
        lines = f.readlines()

    commits = []
    # Parse lines to get structural data
    for line in lines:
        if line.startswith('pick '):
            parts = line.split(' ', 2)
            sha = parts[1]
            msg = parts[2].strip()
            commits.append({'line': line, 'sha': sha, 'msg': msg, 'action': 'pick'})
        else:
            # Preserve comments/commands as-is, store them as simple strings
            commits.append({'line': line, 'type': 'raw'})

    # Define targets
    targets = [
        "chore: remove vercel specific branding",
        "chore: minor adjustments",
        "style: improve UI design",
        "fix: resolve [object Object]",
        "fix: resolve Image with src",
        "fix: resolve Network Error"
    ]

    # Algorithm:
    # Iterate. Keep track of the 'active' index for each target message.
    # If we find a match, and it's within N commits of the active index, squashing it.
    # Otherwise, update active index.
    
    last_seen = {} # { msg: index_in_commits_list }
    DISTANCE_THRESHOLD = 10 # Commits apart

    for i, c in enumerate(commits):
        if c.get('type') == 'raw':
            continue
        
        msg = c['msg']
        # Check partial match for targets
        matched_target = None
        for t in targets:
            if t in msg:
                matched_target = t
                break
        
        if matched_target:
            # We use the matched_target string as key to group variations if necessary
            # But the user asked for "same commits", so exact message usually best, or the target substring.
            # let's use the target substring as the key so slightly different variations squash together if they share the prefix
            key = matched_target
            
            if key in last_seen:
                prev_idx = last_seen[key]
                distance = i - prev_idx
                if distance <= DISTANCE_THRESHOLD:
                    # Squash into the previous one
                    # We modify the CURRENT line to be 'squash'
                    # But wait, standard rebase expects 'squash' to follow the pick. 
                    # If there are intervening commits (distance > 1), we have to MOVE this commit to be after prev_idx.
                    
                    # Instead of moving complexity, let's just mark it 'squash' IF distance is small.
                    # AND we have to move it in the list.
                    
                    # Logic to move: remove from current `i`, insert at `prev_idx + 1`.
                    # But inserting changes indices.
                    
                    # Simplified approach for this script:
                    # build a new list.
                    pass 
                else:
                   last_seen[key] = i
            else:
                last_seen[key] = i

    # Real implementation of reordering:
    # We need a robust way to reorder. 
    # Let's perform a second pass or use a "buckets" strategies.
    
    # Actually, simpler:
    # Go through list. If item should be squashed into X, add it to X's "squash_children" list.
    # Remove it from main list.
    # Reconstruct list.
    
    final_commits = [] # List of commit objects (or raw lines)
    
    # Map from index to item
    # We need stable indices.
    
    # Let's verify the distance logic again.
    # 0: pick A (feat)  <- last_seen['feat'] = 0
    # 1: pick B (other)
    # 2: pick C (feat)  <- distance = 2. Squash into 0.
    
    # We want result:
    # pick A
    # squash C
    # pick B
    
    # This is safe-ish.
    
    commit_objects = [c for c in commits if c.get('type') != 'raw']
    raw_map = {id(c): c for c in commits} # To verify which are raw
    
    # We will build a "cluster" map.
    # clusters = { master_sha: [list of follower_shas] }
    # commit_to_master = { follower_sha: master_sha }
    
    clusters = {}
    master_map = {}
    
    last_seen_obj = {} # { key: commit_object }

    for i, c in enumerate(commit_objects):
        msg = c['msg']
        key = None
        for t in targets:
            if t in msg:
                key = t
                break
        
        if key:
            if key in last_seen_obj:
                prev_c = last_seen_obj[key]
                # Calculate distance in the original commit_objects list
                # (approximate distance in history)
                idx_current = commit_objects.index(c)
                idx_prev = commit_objects.index(prev_c)
                dist = idx_current - idx_prev
                
                if dist <= DISTANCE_THRESHOLD:
                    # Squash c into prev_c
                    if prev_c['sha'] not in clusters:
                        clusters[prev_c['sha']] = []
                    clusters[prev_c['sha']].append(c)
                    master_map[c['sha']] = prev_c['sha']
                else:
                    # Too far, this becomes new master
                    last_seen_obj[key] = c
            else:
                last_seen_obj[key] = c

    # Now reconstruct the lines
    new_lines = []
    processed_shas = set()
    
    for line_obj in commits:
        if line_obj.get('type') == 'raw':
            new_lines.append(line_obj['line'])
            continue
            
        sha = line_obj['sha']
        
        # If this commit is a follower, skip it (it's already moved or will be)
        if sha in master_map:
            continue
            
        # If this commit is a master, print it, then print its followers
        new_lines.append(line_obj['line'])
        processed_shas.add(sha)
        
        if sha in clusters:
            followers = clusters[sha]
            for f in followers:
                # Change pick to squash
                l = f['line'].replace('pick ', 'squash ')
                new_lines.append(l)
                processed_shas.add(f['sha'])

    with open(filepath, 'w') as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()
