
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Editor, { useMonaco } from '@monaco-editor/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Wand2, Play, Terminal } from 'lucide-react';
import { analyzeCode } from '@/ai/flows/code-analyzer-flow';
import { type CodeTask, type CodeLanguage } from '@/ai/flows/code-analyzer-flow-types';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const languages: CodeLanguage[] = ['JavaScript', 'Python', 'TypeScript', 'Java', 'C#', 'C++', 'Go', 'Rust', 'C', 'Swift', 'HTML', 'CSS', 'SQL', 'Assembly', 'Lisp', 'Fortran', 'COBOL', 'Pascal', 'Perl', 'LOLCODE', 'Whitespace', 'Brainf*ck', 'ArnoldC', 'Shakespeare'];
const exampleTypes = ["Hello World", "Bubble Sort", "Factorial", "FizzBuzz", "Prime Number Check", "Palindrome Check", "Fibonacci Sequence", "Tower of Hanoi", "Binary Search", "99 Bottles of Beer", "Cat Program", "Quine", "Simple Web Server", "Simple Class", "Canvas Drawing"];
const tasks: CodeTask[] = ['explain', 'refactor', 'comment', 'debug', 'optimize', 'test'];

const codeExamples: Record<string, Partial<Record<CodeLanguage, string>>> = {
  "Hello World": {
    'JavaScript': 'console.log("Hello, World!");',
    'Python': 'print("Hello, World!")',
    'TypeScript': 'const message: string = "Hello, World!";\nconsole.log(message);',
    'Java': 'class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}',
    'C#': 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
    'C++': '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}',
    'Go': 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    'Rust': 'fn main() {\n    println!("Hello, World!");\n}',
    'C': '#include <stdio.h>\n\nint main() {\n   printf("Hello, World!");\n   return 0;\n}',
    'Swift': 'print("Hello, World!")',
    'HTML': '<h1>Hello, World!</h1>',
    'CSS': 'body::before {\n  content: "Hello, World!";\n  font-size: 2rem;\n  font-weight: bold;\n}',
    'SQL': "SELECT 'Hello, World!';",
    'Assembly': '; Linux 64-bit, NASM\nsection .data\n    msg db \'Hello, World!\', 0xa ; The string and a newline\n    len equ $ - msg         ; The length of the string\n\nsection .text\n    global _start\n\n_start:\n    ; write(1, msg, len)\n    mov eax, 4              ; syscall for write\n    mov ebx, 1              ; file descriptor 1 is stdout\n    mov ecx, msg            ; pointer to the message\n    mov edx, len            ; message length\n    int 0x80                ; call the kernel\n\n    ; exit(0)\n    mov eax, 1              ; syscall for exit\n    xor ebx, ebx            ; return code 0\n    int 0x80                ; call the kernel',
    'Lisp': '(format t "Hello, World!")',
    'Fortran': 'program HelloWorld\n  print *, "Hello, World!"\nend program HelloWorld',
    'COBOL': 'IDENTIFICATION DIVISION.\nPROGRAM-ID. HelloWorld.\nPROCEDURE DIVISION.\n    DISPLAY "Hello, World!".\n    STOP RUN.',
    'Pascal': 'program HelloWorld;\nbegin\n  writeln(\'Hello, World!\');\nend.',
    'Perl': 'print "Hello, World!\\n";',
    'LOLCODE': 'HAI 1.2\nCAN HAS STDIO?\nVISIBLE "HAI WORLD!"\nKTHXBYE',
    'Whitespace': '   \t\n\t\n \t\t\t\n\t\n  \n\n\n',
    'Brainf*ck': '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.',
    'ArnoldC': 'IT\'S SHOWTIME\nTALK TO THE HAND "Hello World"\nYOU HAVE BEEN TERMINATED',
    'Shakespeare': 'The Uncodable Play.\n\n\t\t\t\t\tHamlet, the Coder.\n\t\t\t\t\tPuck, his Commentator.\n\n\t\t\t\t\t[Enter Hamlet and Puck]\n\n[Scene I: The monologue.]\n\nHamlet:\n You are as lovely as the sum of yourself and a warm summer\'s day.\n Open your heart! Speak your mind! Let us proceed to a new scene.\n\n[Scene II: The dialogue.]\n\nPuck:\n Speak your mind! Let us return to the previous scene.\n\n[Exeunt]',
  },
  "Bubble Sort": {
    'JavaScript': 'function bubbleSort(arr) {\n  let n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}\n\nconsole.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));',
    'Python': 'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n\narr = [64, 34, 25, 12, 22, 11, 90]\nbubble_sort(arr)\nprint("Sorted array is:", arr)',
    'TypeScript': 'function bubbleSort(arr: number[]): number[] {\n  let n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}\n\nlet arr: number[] = [64, 34, 25, 12, 22, 11, 90];\nconsole.log(bubbleSort(arr));',
    'Java': 'import java.util.Arrays;\n\nclass BubbleSort {\n    void bubbleSort(int arr[]) {\n        int n = arr.length;\n        for (int i = 0; i < n-1; i++)\n            for (int j = 0; j < n-i-1; j++)\n                if (arr[j] > arr[j+1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j+1];\n                    arr[j+1] = temp;\n                }\n    }\n\n    public static void main(String args[]) {\n        BubbleSort ob = new BubbleSort();\n        int arr[] = {64, 34, 25, 12, 22, 11, 90};\n        ob.bubbleSort(arr);\n        System.out.println("Sorted array: " + Arrays.toString(arr));\n    }\n}',
    'C#': 'using System;\n\nclass BubbleSort {\n    static void bubbleSort(int[] arr) {\n        int n = arr.Length;\n        for (int i = 0; i < n - 1; i++)\n            for (int j = 0; j < n - i - 1; j++)\n                if (arr[j] > arr[j + 1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j + 1];\n                    arr[j + 1] = temp;\n                }\n    }\n\n    public static void Main() {\n        int[] arr = {64, 34, 25, 12, 22, 11, 90};\n        bubbleSort(arr);\n        Console.WriteLine("Sorted array: [{0}]", string.Join(", ", arr));\n    }\n}',
    'C++': '#include <iostream>\n#include <vector>\n#include <algorithm>\n\nvoid bubbleSort(std::vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n-1; i++)\n        for (int j = 0; j < n-i-1; j++)\n            if (arr[j] > arr[j+1])\n                std::swap(arr[j], arr[j+1]);\n}\n\nint main() {\n    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};\n    bubbleSort(arr);\n    std::cout << "Sorted array: ";\n    for(int i : arr) std::cout << i << " ";\n    std::cout << std::endl;\n    return 0;\n}',
    'Go': 'package main\n\nimport "fmt"\n\nfunc bubbleSort(arr []int) {\n    n := len(arr)\n    for i := 0; i < n-1; i++ {\n        for j := 0; j < n-i-1; j++ {\n            if arr[j] > arr[j+1] {\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n            }\n        }\n    }\n}\n\nfunc main() {\n    arr := []int{64, 34, 25, 12, 22, 11, 90}\n    bubbleSort(arr)\n    fmt.Println("Sorted array:", arr)\n}',
    'Rust': 'fn bubble_sort(arr: &mut [i32]) {\n    let n = arr.len();\n    for i in 0..n {\n        for j in 0..n - 1 - i {\n            if arr[j] > arr[j + 1] {\n                arr.swap(j, j + 1);\n            }\n        }\n    }\n}\n\nfn main() {\n    let mut numbers = [64, 34, 25, 12, 22, 11, 90];\n    bubble_sort(&mut numbers);\n    println!("Sorted array: {:?}", numbers);\n}',
    'C': '#include <stdio.h>\n\nvoid swap(int* xp, int* yp) {\n    int temp = *xp;\n    *xp = *yp;\n    *yp = temp;\n}\n\nvoid bubbleSort(int arr[], int n) {\n    int i, j;\n    for (i = 0; i < n - 1; i++)\n        for (j = 0; j < n - i - 1; j++)\n            if (arr[j] > arr[j + 1])\n                swap(&arr[j], &arr[j + 1]);\n}\n\nvoid printArray(int arr[], int size) {\n    for (int i = 0; i < size; i++)\n        printf("%d ", arr[i]);\n    printf("\\n");\n}\n\nint main() {\n    int arr[] = { 64, 34, 25, 12, 22, 11, 90 };\n    int n = sizeof(arr) / sizeof(arr[0]);\n    bubbleSort(arr, n);\n    printf("Sorted array: \\n");\n    printArray(arr, n);\n    return 0;\n}',
    'Swift': 'func bubbleSort(_ array: [Int]) -> [Int] {\n    var arr = array\n    for i in 0..<arr.count {\n        for j in 1..<arr.count - i {\n            if arr[j-1] > arr[j] {\n                arr.swapAt(j-1, j)\n            }\n        }\n    }\n    return arr\n}\n\nlet list = [64, 34, 25, 12, 22, 11, 90]\nprint(bubbleSort(list))',
    'Perl': 'sub bubble_sort {\n    my @arr = @_;\n    my $n = scalar @arr;\n    for my $i (0..$n-1) {\n        for my $j (0..$n-$i-2) {\n            if ($arr[$j] > $arr[$j+1]) {\n                @arr[$j, $j+1] = @arr[$j+1, $j];\n            }\n        }\n    }\n    return @arr;\n}\n\nmy @sorted_arr = bubble_sort(64, 34, 25, 12, 22, 11, 90);\nprint "Sorted array: @sorted_arr\\n";',
    'Pascal': 'program BubbleSortDemo;\nvar\n  arr: array[1..7] of integer = (64, 34, 25, 12, 22, 11, 90);\n  i, j, temp, n: integer;\nbegin\n  n := 7;\n  for i := 1 to n-1 do\n  begin\n    for j := 1 to n-i do\n    begin\n      if arr[j] > arr[j+1] then\n      begin\n        temp := arr[j];\n        arr[j] := arr[j+1];\n        arr[j+1] := temp;\n      end;\n    end;\n  end;\n  writeln(\'Sorted array: \');\n  for i := 1 to n do\n    write(arr[i], \' \');\n  writeln;\nend.',
    'Lisp': '(defun bubble-sort (list)\n  (let ((len (length list)))\n    (dotimes (i len list)\n      (loop for j from 0 below (- len 1 i)\n        do (when (> (nth j list) (nth (1+ j) list))\n             (rotatef (nth j list) (nth (1+ j) list)))))))\n\n(print (bubble-sort \'(64 34 25 12 22 11 90)))',
    'Fortran': 'PROGRAM BUBBLE_SORT\n  IMPLICIT NONE\n  INTEGER, PARAMETER :: N = 7\n  INTEGER, DIMENSION(N) :: arr = (/64, 34, 25, 12, 22, 11, 90/)\n  INTEGER :: i, j, temp\n\n  DO i = 1, N-1\n    DO j = 1, N-i\n      IF (arr(j) > arr(j+1)) THEN\n        temp = arr(j)\n        arr(j) = arr(j+1)\n        arr(j+1) = temp\n      END IF\n    END DO\n  END DO\n\n  PRINT *, "Sorted array:"\n  PRINT *, arr\n\nEND PROGRAM BUBBLE_SORT',
    'COBOL': 'IDENTIFICATION DIVISION.\nPROGRAM-ID. BubbleSort.\nDATA DIVISION.\nWORKING-STORAGE SECTION.\n01 ARRAY-AREA.\n   05 INT-ARRAY OCCURS 7 TIMES PIC 99.\n01 I         PIC 9.\n01 J         PIC 9.\n01 N         PIC 9 VALUE 7.\n01 TEMP      PIC 99.\n\nPROCEDURE DIVISION.\n    MOVE 64 TO INT-ARRAY(1).\n    MOVE 34 TO INT-ARRAY(2).\n    MOVE 25 TO INT-ARRAY(3).\n    MOVE 12 TO INT-ARRAY(4).\n    MOVE 22 TO INT-ARRAY(5).\n    MOVE 11 TO INT-ARRAY(6).\n    MOVE 90 TO INT-ARRAY(7).\n\n    PERFORM VARYING I FROM 1 BY 1 UNTIL I > N - 1\n        PERFORM VARYING J FROM 1 BY 1 UNTIL J > N - I\n            IF INT-ARRAY(J) > INT-ARRAY(J + 1) THEN\n                MOVE INT-ARRAY(J) TO TEMP\n                MOVE INT-ARRAY(J + 1) TO INT-ARRAY(J)\n                MOVE TEMP TO INT-ARRAY(J + 1)\n            END-IF\n        END-PERFORM\n    END-PERFORM.\n\n    DISPLAY "Sorted Array:".\n    PERFORM VARYING I FROM 1 BY 1 UNTIL I > N\n        DISPLAY INT-ARRAY(I)\n    END-PERFORM.\n    STOP RUN.',
  },
  "Factorial": {
    'JavaScript': 'function factorial(n) {\n  if (n < 0) return "undefined";\n  if (n === 0) return 1;\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5)); // 120',
    'Python': 'def factorial(n):\n    if n < 0:\n        return "undefined"\n    elif n == 0:\n        return 1\n    else:\n        return n * factorial(n-1)\n\nprint(factorial(5)) # 120',
    'TypeScript': 'function factorial(n: number): number | string {\n  if (n < 0) return "undefined";\n  if (n === 0) return 1;\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5)); // 120',
    'Java': 'class Factorial {\n    static int factorial(int n) {\n        if (n < 0) return -1; // Or throw exception\n        if (n == 0) return 1;\n        return n * factorial(n - 1);\n    }\n\n    public static void main(String[] args) {\n        System.out.println("Factorial of 5 is " + factorial(5));\n    }\n}',
    'C#': 'using System;\n\npublic class FactorialExample {\n    public static int Factorial(int number) {\n        if (number < 0) throw new ArgumentException("Input must be non-negative");\n        if (number == 0) return 1;\n        return number * Factorial(number - 1);\n    }\n\n    public static void Main() {\n        Console.WriteLine("Factorial of 5 is " + Factorial(5));\n    }\n}',
    'C++': '#include <iostream>\n\nlong long factorial(int n) {\n    if (n < 0) return -1; // Error\n    if (n == 0) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    std::cout << "Factorial of 5 is " << factorial(5);\n    return 0;\n}',
    'Go': 'package main\n\nimport "fmt"\n\nfunc factorial(n int) int {\n    if n < 0 { return 0 } // Error case\n    if n == 0 {\n        return 1\n    }\n    return n * factorial(n-1)\n}\n\nfunc main() {\n    fmt.Println("Factorial of 5 is", factorial(5))\n}',
    'Rust': 'fn factorial(n: u64) -> u64 {\n    match n {\n        0 => 1,\n        _ => n * factorial(n - 1),\n    }\n}\n\nfn main() {\n    println!("Factorial of 5 is {}", factorial(5));\n}',
    'C': '#include<stdio.h>\n\nlong int factorial(int n) {\n  if (n < 0) return -1; // Error\n  if (n>=1)\n    return n*factorial(n-1);\n  else\n    return 1;\n}\n\nint main() {\n  int n = 5;\n  printf("Factorial of %d = %ld", n, factorial(n));\n  return 0;\n}',
    'Swift': 'func factorial(_ n: Int) -> Int {\n    guard n >= 0 else { return 0 } // Or throw error\n    return n == 0 ? 1 : n * factorial(n - 1)\n}\n\nprint("Factorial of 5 is \\(factorial(5))")',
    'Assembly': '; Computes factorial of a number (e.g., 5) using recursion\n; Linux 64-bit, NASM\n\nsection .text\n    global _start\n\nfactorial:\n    ; Input: rax, Output: rax\n    cmp rax, 1\n    jle .end_factorial ; if n <= 1, return 1\n    dec rax\n    call factorial\n    inc rax\n    mul rax\n    ret\n\n.end_factorial:\n    mov rax, 1\n    ret\n\n_start:\n    mov rax, 5      ; Calculate factorial of 5\n    call factorial\n    \n    ; The result is in rax. For this example, we don\'t print it.\n    ; To exit, we move the result to rdi for the exit code.\n    mov rdi, rax\n    mov rax, 60     ; syscall for exit\n    syscall',
    'Perl': 'sub factorial {\n    my ($n) = @_;\n    return 1 if $n == 0;\n    return $n * factorial($n-1);\n}\n\nprint "Factorial of 5 is ", factorial(5), "\\n";',
    'Pascal': 'program FactorialRecursive;\nfunction factorial(n: integer): longint;\nbegin\n  if n = 0 then\n    factorial := 1\n  else\n    factorial := n * factorial(n-1);\nend;\n\nbegin\n  writeln(\'Factorial of 5 is \', factorial(5));\nend.',
    'Lisp': '(defun factorial (n)\n  (if (zerop n)\n      1\n      (* n (factorial (- n 1)))))\n(format t "Factorial of 5 is ~d" (factorial 5))',
    'Fortran': 'PROGRAM FactorialTest\n  IMPLICIT NONE\n  INTEGER :: num = 5\n  PRINT *, "Factorial of", num, "is", factorial(num)\n\nCONTAINS\n\n  RECURSIVE FUNCTION factorial(n) RESULT(res)\n    INTEGER, INTENT(IN) :: n\n    INTEGER :: res\n    IF (n == 0) THEN\n      res = 1\n    ELSE\n      res = n * factorial(n-1)\n    END IF\n  END FUNCTION factorial\n\nEND PROGRAM FactorialTest',
    'COBOL': 'IDENTIFICATION DIVISION.\nPROGRAM-ID. Factorial.\nDATA DIVISION.\nWORKING-STORAGE SECTION.\n01 N          PIC 99 VALUE 5.\n01 RESULT     PIC 9(8) VALUE 1.\n01 I          PIC 99.\n\nPROCEDURE DIVISION.\n    PERFORM VARYING I FROM 1 BY 1 UNTIL I > N\n        COMPUTE RESULT = RESULT * I\n    END-PERFORM.\n    DISPLAY "Factorial of " N " is " RESULT.\n    STOP RUN.',
  },
  "FizzBuzz": {
    'JavaScript': 'for (let i = 1; i <= 100; i++) {\n  let output = "";\n  if (i % 3 === 0) output += "Fizz";\n  if (i % 5 === 0) output += "Buzz";\n  console.log(output || i);\n}',
    'Python': 'for i in range(1, 101):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)',
    'TypeScript': 'for (let i: number = 1; i <= 100; i++) {\n  if (i % 15 === 0) console.log("FizzBuzz");\n  else if (i % 3 === 0) console.log("Fizz");\n  else if (i % 5 === 0) console.log("Buzz");\n  else console.log(i);\n}',
    'Java': 'class FizzBuzz {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 100; i++) {\n            String output = "";\n            if (i % 3 == 0) output += "Fizz";\n            if (i % 5 == 0) output += "Buzz";\n            if (output.isEmpty()) output = Integer.toString(i);\n            System.out.println(output);\n        }\n    }\n}',
    'C#': 'using System;\n\nclass FizzBuzz {\n    static void Main() {\n        for (int i = 1; i <= 100; i++) {\n            if (i % 15 == 0) Console.WriteLine("FizzBuzz");\n            else if (i % 3 == 0) Console.WriteLine("Fizz");\n            else if (i % 5 == 0) Console.WriteLine("Buzz");\n            else Console.WriteLine(i);\n        }\n    }\n}',
    'C++': '#include <iostream>\n\nint main() {\n    for (int i = 1; i <= 100; ++i) {\n        if (i % 15 == 0) std::cout << "FizzBuzz\\n";\n        else if (i % 3 == 0) std::cout << "Fizz\\n";\n        else if (i % 5 == 0) std::cout << "Buzz\\n";\n        else std::cout << i << "\\n";\n    }\n    return 0;\n}',
    'Go': 'package main\n\nimport "fmt"\n\nfunc main() {\n    for i := 1; i <= 100; i++ {\n        if i%15 == 0 {\n            fmt.Println("FizzBuzz")\n        } else if i%3 == 0 {\n            fmt.Println("Fizz")\n        } else if i%5 == 0 {\n            fmt.Println("Buzz")\n        } else {\n            fmt.Println(i)\n        }\n    }\n}',
    'Rust': 'fn main() {\n    for i in 1..=100 {\n        match (i % 3, i % 5) {\n            (0, 0) => println!("FizzBuzz"),\n            (0, _) => println!("Fizz"),\n            (_, 0) => println!("Buzz"),\n            _ => println!("{}", i),\n        }\n    }\n}',
    'C': '#include <stdio.h>\n\nint main(void) {\n    for (int i = 1; i <= 100; i++) {\n        if (i % 15 == 0) {\n            printf("FizzBuzz\\n");\n        } else if (i % 3 == 0) {\n            printf("Fizz\\n");\n        } else if (i % 5 == 0) {\n            printf("Buzz\\n");\n        } else {\n            printf("%d\\n", i);\n        }\n    }\n    return 0;\n}',
    'Swift': 'for i in 1...100 {\n    if i.isMultiple(of: 15) {\n        print("FizzBuzz")\n    } else if i.isMultiple(of: 3) {\n        print("Fizz")\n    } else if i.isMultiple(of: 5) {\n        print("Buzz")\n    } else {\n        print(i)\n    }\n}',
    'SQL': 'WITH RECURSIVE CteNumbers(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM CteNumbers WHERE n < 100\n)\nSELECT\n  CASE\n    WHEN n % 15 = 0 THEN \'FizzBuzz\'\n    WHEN n % 3 = 0 THEN \'Fizz\'\n    WHEN n % 5 = 0 THEN \'Buzz\'\n    ELSE CAST(n AS CHAR)\n  END AS Result\nFROM CteNumbers;',
    'Perl': 'for my $i (1..100) {\n    if ($i % 15 == 0) {\n        print "FizzBuzz\\n";\n    } elsif ($i % 3 == 0) {\n        print "Fizz\\n";\n    } elsif ($i % 5 == 0) {\n        print "Buzz\\n";\n    } else {\n        print "$i\\n";\n    }\n}',
    'Pascal': 'program FizzBuzzGame;\nvar i: integer;\nbegin\n  for i := 1 to 100 do\n  begin\n    if (i mod 15) = 0 then\n      writeln(\'FizzBuzz\')\n    else if (i mod 3) = 0 then\n      writeln(\'Fizz\')\n    else if (i mod 5) = 0 then\n      writeln(\'Buzz\')\n    else\n      writeln(i);\n  end;\nend.',
    'Lisp': '(loop for i from 1 to 100 do\n   (cond ((= (mod i 15) 0) (format t "FizzBuzz~%"))\n         ((= (mod i 3) 0) (format t "Fizz~%"))\n         ((= (mod i 5) 0) (format t "Buzz~%"))\n         (t (format t "~d~%" i))))',
    'Fortran': 'PROGRAM FizzBuzz\n  IMPLICIT NONE\n  INTEGER :: i\n\n  DO i = 1, 100\n    IF (MOD(i, 15) == 0) THEN\n      PRINT *, "FizzBuzz"\n    ELSE IF (MOD(i, 3) == 0) THEN\n      PRINT *, "Fizz"\n    ELSE IF (MOD(i, 5) == 0) THEN\n      PRINT *, "Buzz"\n    ELSE\n      PRINT *, i\n    END IF\n  END DO\n\nEND PROGRAM FizzBuzz',
    'COBOL': 'IDENTIFICATION DIVISION.\nPROGRAM-ID. FizzBuzz.\nDATA DIVISION.\nWORKING-STORAGE SECTION.\n01 I        PIC 999.\n01 MOD-15   PIC 99.\n01 MOD-5    PIC 99.\n01 MOD-3    PIC 99.\n01 DUMMY    PIC 99.\n\nPROCEDURE DIVISION.\n    PERFORM VARYING I FROM 1 BY 1 UNTIL I > 100\n        DIVIDE I BY 15 GIVING DUMMY REMAINDER MOD-15.\n        DIVIDE I BY 5 GIVING DUMMY REMAINDER MOD-5.\n        DIVIDE I BY 3 GIVING DUMMY REMAINDER MOD-3.\n\n        IF MOD-15 = 0 THEN\n            DISPLAY "FizzBuzz"\n        ELSE IF MOD-5 = 0 THEN\n            DISPLAY "Buzz"\n        ELSE IF MOD-3 = 0 THEN\n            DISPLAY "Fizz"\n        ELSE\n            DISPLAY I\n        END-IF\n    END-PERFORM.\n    STOP RUN.',
  },
  "Prime Number Check": {
      'JavaScript': ['true', 'false'],
      'Python': ['True', 'False'],
      'TypeScript': ['true', 'false'],
      'Java': ['Is 29 prime? true', 'Is 10 prime? false'],
      'C#': ['Is 29 prime? True', 'Is 10 prime? False'],
      'C++': ['Is 29 prime? true', 'Is 10 prime? false'],
      'Go': ['Is 29 prime? true', 'Is 10 prime? false'],
      'Rust': ['Is 29 prime? true', 'Is 10 prime? false'],
      'C': ['29 is prime: true', '10 is prime: false'],
      'Swift': ['Is 29 prime? true', 'Is 10 prime? false'],
      'Perl': ['Is 29 prime? 1\\n', 'Is 10 prime? 0\\n'],
  },
  "Palindrome Check": {
      'JavaScript': ['true'],
      'Python': ['True'],
      'TypeScript': ['true'],
      'Java': ['true'],
      'C#': ['True'],
      'C++': ['true'],
      'Go': ['true'],
      'Rust': ['true'],
      'C': ['Is a palindrome.'],
      'Swift': ['true'],
  },
  "Fibonacci Sequence": {
      'JavaScript': ['55'],
      'Python': ['55'],
      'Go': ['55'],
      'C': ['55'],
      'Rust': ['55'],
      'Java': ['55'],
      'C#': ['55'],
  },
  "Tower of Hanoi": {
      'JavaScript': ['Move disk 1 from rod A to rod C', 'Move disk 2 from rod A to rod B', 'Move disk 1 from rod C to rod B', 'Move disk 3 from rod A to rod C', 'Move disk 1 from rod B to rod A', 'Move disk 2 from rod B to rod C', 'Move disk 1 from rod A to rod C'],
      'Python': ['Move disk 1 from A to C', 'Move disk 2 from A to B', 'Move disk 1 from C to B', 'Move disk 3 from A to C', 'Move disk 1 from B to A', 'Move disk 2 from B to C', 'Move disk 1 from A to C'],
      'C': ['Move disk 1 from rod A to rod C', 'Move disk 2 from rod A to rod B', 'Move disk 1 from rod C to rod B', 'Move disk 3 from rod A to rod C', 'Move disk 1 from rod B to rod A', 'Move disk 2 from rod B to rod C', 'Move disk 1 from rod A to rod C'],
      'Go': ['Move disk 1 from A to C', 'Move disk 2 from A to B', 'Move disk 1 from C to B', 'Move disk 3 from A to C', 'Move disk 1 from B to A', 'Move disk 2 from B to C', 'Move disk 1 from A to C'],
      'Java': ['Move disk 1 from A to C', 'Move disk 2 from A to B', 'Move disk 1 from C to B', 'Move disk 3 from A to C', 'Move disk 1 from B to A', 'Move disk 2 from B to C', 'Move disk 1 from A to C'],
      'C++': ['Move disk 1 from A to C', 'Move disk 2 from A to B', 'Move disk 1 from C to B', 'Move disk 3 from A to C', 'Move disk 1 from B to A', 'Move disk 2 from B to C', 'Move disk 1 from A to C'],
  },
  "Binary Search": {
      'JavaScript': ['3'],
      'Python': ['3'],
      'C': ['Element found at index 3'],
      'Java': ['Element found at index 3'],
      'Go': ['Found at index: 3'],
      'Rust': ['Found at index: Some(3)'],
  },
  "99 Bottles of Beer": {
      'JavaScript': ["... (99 verses) ..."],
      'Python': ["... (99 verses) ..."],
      'C': ["... (99 verses) ..."],
      'Go': ["... (99 verses) ..."],
      'Java': ["... (99 verses) ..."],
  },
  "Simple Class": {
      'JavaScript': ['Rex says Woof!'],
      'Python': ['Rex says Woof!'],
      'TypeScript': ['Rex says Woof!'],
      'Java': ['Rex says Woof!'],
      'C#': ['Rex says Woof!'],
      'C++': ['Rex says Woof!'],
      'Go': ['Rex says Woof!'],
      'Rust': ['Rex says Woof!'],
      'Swift': ['Rex says Woof!'],
      'Perl': ['Rex says Woof!\\n'],
  },
};


export default function CodeEditor() {
  const { toast } = useToast();
  const [example, setExample] = useState<string>(exampleTypes[0]);
  const [availableExamples, setAvailableExamples] = useState<string[]>([]);
  const [code, setCode] = useState<string>('');
  const [task, setTask] = useState<CodeTask>('explain');
  const [language, setLanguage] = useState<CodeLanguage>('JavaScript');
  const [aiOutput, setAiOutput] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ai-output');
  
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

  useEffect(() => {
    // Define a custom theme for Monaco that makes the text and background transparent
    monaco?.editor.defineTheme('transparent-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000', // Transparent background
        'editor.foreground': '#00000000', // Fully transparent text
        'editorCursor.foreground': '#FFFFFF', // White cursor
        'editor.selectionBackground': '#FFFFFF20', // Barely visible selection
      },
    });
    monaco?.editor.setTheme('transparent-theme');
  }, [monaco]);


  useEffect(() => {
    // Filter available example types based on the selected language
    const examplesForLang = exampleTypes.filter(exType => codeExamples[exType]?.[language] !== undefined);
    setAvailableExamples(examplesForLang);

    // If the current example is not available for the new language, switch to the first available one
    if (!examplesForLang.includes(example)) {
      const newExample = examplesForLang[0] || '';
      setExample(newExample);
      const newCode = newExample ? (codeExamples[newExample]?.[language] || `// No '${newExample}' example available for ${language}.`) : `// No examples available for ${language}.`;
      setCode(newCode);
    } else {
      // Otherwise, just update the code for the current example and new language
      const newCode = codeExamples[example]?.[language] || `// No '${example}' example available for ${language}.`;
      setCode(newCode);
    }
  }, [language, example]);

  const handleRunCode = () => {
    setConsoleOutput([]);
    setActiveTab('console-output');

    const expectedCode = codeExamples[example]?.[language];
    const isUnmodifiedExample = expectedCode ? code.trim() === expectedCode.trim() : false;

    if (isUnmodifiedExample) {
        const output = consoleOutputs[example]?.[language];
        if (output) {
            setConsoleOutput(output);
            return;
        }
    }
    
    if (language === 'JavaScript') {
        const originalLog = console.log;
        const newLogs: string[] = [];
        console.log = (...args) => {
            const formattedArgs = args.map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    try { return JSON.stringify(arg, null, 2); } catch { return '[Circular Object]'; }
                }
                return String(arg);
            }).join(' ');
            newLogs.push(formattedArgs);
        };
        try {
            // eslint-disable-next-line no-eval
            eval(code);
        } catch (error: any) {
            newLogs.push(`Error: ${error.message}`);
        } finally {
            console.log = originalLog;
            setConsoleOutput(newLogs.length > 0 ? newLogs : ['Code executed successfully with no console output.']);
        }
    } else {
        setConsoleOutput([
            `Custom code execution is only available for JavaScript.`,
            `For ${language}, you can run the original, unmodified examples to see their simulated output.`
        ]);
    }
};


  const handleSubmit = async () => {
    if (code.trim() === '') {
        toast({
            title: 'No Code Provided',
            description: 'Please enter some code in the editor before running a task.',
            variant: 'destructive'
        });
        return;
    }
    setLoading(true);
    setAiOutput('');
    setActiveTab('ai-output');

    try {
      const result = await analyzeCode({ task, code, language });
      if (result) {
        setAiOutput(result);
      } else {
        setAiOutput("The AI did not return a response. This could be due to a safety filter or a network issue. Please try modifying your code or task.");
        toast({
            title: 'Empty Response',
            description: 'The AI did not return a response.',
            variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error(error);
      setAiOutput(`An error occurred while processing the code: ${error.message}`);
      toast({
        title: 'An Error Occurred',
        description: error.message || 'Failed to get a response from the AI.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const editorStyle = {
    lineHeight: '1.5',
    letterSpacing: '0.025em',
    fontSize: '18px',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4 bg-card">
        {/* Editor Panel */}
        <div className="flex flex-col gap-4">
             <div className="relative flex-grow font-mono text-lg p-4 rounded-lg bg-black/30 border border-gray-700 overflow-hidden">
                <pre
                    aria-hidden="true"
                    className="whitespace-pre-wrap select-none w-full h-full overflow-auto"
                    style={editorStyle}
                    dangerouslySetInnerHTML={{ __html: code + '\n' }}
                />
                <div
                    className="absolute top-4 left-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)]"
                >
                    <Editor
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        onMount={(editor) => { editorRef.current = editor; editor.focus(); }}
                        language={language.toLowerCase()}
                        theme="transparent-theme"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 18,
                            lineHeight: 27, // 18 * 1.5
                            letterSpacing: 0.45,
                            lineNumbers: 'off',
                            glyphMargin: false,
                            folding: false,
                            lineDecorationsWidth: 0,
                            lineNumbersMinChars: 0,
                            wordWrap: 'on',
                            scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                            overviewRulerLanes: 0,
                            hideCursorInOverviewRuler: true,
                            cursorBlinking: 'smooth',
                            cursorStyle: 'line',
                            renderLineHighlight: 'none',
                            overviewRulerBorder: false,
                            padding: { top: 0, bottom: 0 },
                        }}
                    />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <div className='flex-grow'>
                    <Label htmlFor='example-select' className='text-xs text-muted-foreground'>Example</Label>
                    <Select value={example} onValueChange={(v) => setExample(v)}>
                        <SelectTrigger id='example-select' className="w-full">
                            <SelectValue placeholder="Select an example" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableExamples.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex-grow'>
                    <Label htmlFor='lang-select' className='text-xs text-muted-foreground'>Language</Label>
                    <Select value={language} onValueChange={(v) => setLanguage(v as CodeLanguage)}>
                        <SelectTrigger id='lang-select' className="w-full">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                           {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className='flex-grow'>
                    <Label htmlFor='task-select' className='text-xs text-muted-foreground'>AI Task</Label>
                    <Select value={task} onValueChange={(v) => setTask(v as CodeTask)}>
                        <SelectTrigger id='task-select' className="w-full capitalize">
                            <SelectValue placeholder="Select a task" />
                        </SelectTrigger>
                        <SelectContent>
                            {tasks.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="flex gap-2">
                <Button onClick={handleRunCode} variant="secondary" className="w-full">
                    <Play className="mr-2 h-4 w-4" /> Run Code
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Run AI Task
                </Button>
            </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col border border-border rounded-md shadow-inner">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
            <TabsList className="m-2">
              <TabsTrigger value="ai-output">
                <Wand2 className="mr-2 h-4 w-4" /> AI Output
              </TabsTrigger>
              <TabsTrigger value="console-output">
                <Terminal className="mr-2 h-4 w-4" /> Console
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ai-output" className="flex-grow overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-full flex-col gap-4 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p>AI is thinking...</p>
                    </div>
                  ) : aiOutput ? (
                    <article className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiOutput}</ReactMarkdown>
                    </article>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>AI output will appear here.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="console-output" className="flex-grow overflow-hidden mt-0">
               <ScrollArea className="h-full">
                 <div className="p-4 font-mono text-xs text-foreground">
                    {consoleOutput.length > 0 ? (
                        consoleOutput.map((line, index) => (
                            <div key={index} className="border-b border-border/20 p-1 whitespace-pre-wrap">{line}</div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Code output will appear here.</p>
                        </div>
                    )}
                 </div>
               </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        <style jsx global>{`
            .prose code {
                font-size: 0.8rem;
            }
            .prose pre {
                background-color: hsl(var(--muted) / 0.5);
                border: 1px solid hsl(var(--border));
            }
        `}</style>
    </div>
  );
}
