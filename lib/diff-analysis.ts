export type Candidate={ruleId:string;filePath:string;line?:number;evidence:string;severity:"HIGH"|"MEDIUM"|"LOW"};

/** Parses only added lines: pre-existing issues are deliberately excluded. */
export function findingsFromDiff(diff:string):Candidate[]{
  const found:Candidate[]=[];let file="",line=0;
  for(const text of diff.split("\n")){
    const fileMatch=/^\+\+\+ b\/(.+)$/.exec(text);if(fileMatch){file=fileMatch[1]??"";continue}
    const hunk=/^@@ -\d+(?:,\d+)? \+(\d+)/.exec(text);if(hunk){line=Number(hunk[1]);continue}
    if(text.startsWith("+")&&!text.startsWith("+++")){const code=text.slice(1);const add=(ruleId:string,severity:Candidate["severity"],evidence:string)=>found.push({ruleId,severity,filePath:file,line,evidence});if(/(?:password|api[_-]?key|secret)\s*[:=]\s*["'][^"']{8,}/i.test(code))add("potential-secret","HIGH","Potential credential assignment; value redacted.");if(/\beval\s*\(|child_process\.(?:exec|execSync)\s*\(/.test(code))add("unsafe-dynamic-execution","HIGH","Dynamic command or code execution in changed line.");if(/\bconsole\.(?:log|debug)\s*\(/.test(code))add("debug-output","LOW","Debug output added to changed code.");line++}else if(!text.startsWith("-"))line++
  } return found;
}
