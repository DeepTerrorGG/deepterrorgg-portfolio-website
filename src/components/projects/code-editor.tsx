
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
const unsupportedLanguages: CodeLanguage[] = ['LOLCODE', 'Whitespace', 'Brainf*ck', 'ArnoldC', 'Shakespeare'];

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
    'ArnoldC': 'IT\'S SHOWTIME\nTALK TO THE HAND "Hello, World!"\nYOU HAVE BEEN TERMINATED',
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
    'JavaScript': `function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

console.log(isPrime(29)); // true
console.log(isPrime(15)); // false`,
    'Python': `def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

print(is_prime(29))
print(is_prime(15))`,
  },
  "Palindrome Check": {
    'JavaScript': `function isPalindrome(str) {
  const cleanStr = str.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  const reversedStr = cleanStr.split('').reverse().join('');
  return cleanStr === reversedStr;
}

console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("hello world")); // false`,
    'Python': `def is_palindrome(s):
    s = ''.join(filter(str.isalnum, s)).lower()
    return s == s[::-1]

print(is_palindrome("A man, a plan, a canal: Panama"))
print(is_palindrome("hello world"))`,
  },
  "Fibonacci Sequence": {
    'JavaScript': `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Get the first 10 numbers in the sequence
for (let i = 0; i < 10; i++) {
  console.log(fibonacci(i));
}`,
    'Python': `def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))`,
  },
  "Tower of Hanoi": {
    'JavaScript': `function towerOfHanoi(n, fromRod, toRod, auxRod) {
  if (n === 1) {
    console.log(\`Move disk 1 from rod \${fromRod} to rod \${toRod}\`);
    return;
  }
  towerOfHanoi(n - 1, fromRod, auxRod, toRod);
  console.log(\`Move disk \${n} from rod \${fromRod} to rod \${toRod}\`);
  towerOfHanoi(n - 1, auxRod, toRod, fromRod);
}

towerOfHanoi(3, 'A', 'C', 'B');`,
    'Python': `def tower_of_hanoi(n, source, destination, auxiliary):
    if n == 1:
        print(f"Move disk 1 from {source} to {destination}")
        return
    tower_of_hanoi(n-1, source, auxiliary, destination)
    print(f"Move disk {n} from {source} to {destination}")
    tower_of_hanoi(n-1, auxiliary, destination, source)

tower_of_hanoi(3, 'A', 'C', 'B')`,
  },
  "Binary Search": {
    'JavaScript': `function binarySearch(arr, x) {
    let low = 0;
    let high = arr.length - 1;
    while (high >= low) {
        let mid = low + Math.floor((high - low) / 2);
        if (arr[mid] === x) return mid;
        if (arr[mid] > x) high = mid - 1;
        else low = mid + 1;
    }
    return -1;
}

const arr = [2, 3, 4, 10, 40];
console.log(binarySearch(arr, 10)); // 3`,
    'Python': `def binary_search(arr, x):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (high + low) // 2
        if arr[mid] < x:
            low = mid + 1
        elif arr[mid] > x:
            high = mid - 1
        else:
            return mid
    return -1

arr = [2, 3, 4, 10, 40]
print(binary_search(arr, 10))`,
  },
  "99 Bottles of Beer": {
    'JavaScript': `for (let i = 99; i > 0; i--) {
  console.log(\`\${i} bottle\${i > 1 ? 's' : ''} of beer on the wall, \${i} bottle\${i > 1 ? 's' : ''} of beer.\`);
  console.log(\`Take one down and pass it around, \${i - 1 === 0 ? 'no more' : i - 1} bottle\${i - 1 !== 1 ? 's' : ''} of beer on the wall.\\n\`);
}`,
    'Python': `for i in range(99, 0, -1):
    print(f"{i} bottle{'s' if i > 1 else ''} of beer on the wall, {i} bottle{'s' if i > 1 else ''} of beer.")
    print(f"Take one down and pass it around, {'no more' if i - 1 == 0 else i - 1} bottle{'s' if i - 1 != 1 else ''} of beer on the wall.\\n")`,
  },
  "Cat Program": {
    'JavaScript': `// A simple 'cat' program using Node.js 'fs' module
const fs = require('fs');

if (process.argv.length < 3) {
  console.log('Usage: node cat.js <file>');
  process.exit(1);
}

const filename = process.argv[2];

fs.readFile(filename, 'utf8', (err, data) => {
  if (err) {
    console.error(\`Error reading file: \${err.message}\`);
    process.exit(1);
  }
  console.log(data);
});`,
    'Python': `import sys

if len(sys.argv) < 2:
    print("Usage: python cat.py <file>")
    sys.exit(1)

try:
    with open(sys.argv[1], 'r') as f:
        print(f.read())
except FileNotFoundError:
    print(f"Error: File '{sys.argv[1]}' not found.")
    sys.exit(1)`,
  },
  "Quine": {
    'JavaScript': `const s = 'const s = %s; console.log(s, \`'\` + s + \`'\`);';
console.log(s, \`'\` + s + \`'\`);`,
    'Python': `s = 's = %r; print(s %% s)'; print(s % s)`,
  },
  "Simple Web Server": {
    'JavaScript': `// Node.js example
const http = require('http');
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!');
});

server.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}/\`);
});`,
    'Python': `# Python 3 example
from http.server import BaseHTTPRequestHandler, HTTPServer

class SimpleServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"Hello, World!")

def run(server_class=HTTPServer, handler_class=SimpleServer, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting httpd server on port {port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run()`,
  },
  "Simple Class": {
    'JavaScript': `class Dog {
  constructor(name) {
    this.name = name;
  }

  bark() {
    console.log('Woof!');
  }
}

const myDog = new Dog('Rex');
myDog.bark();`,
    'Python': `class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        print("Woof!")

my_dog = Dog("Rex")
my_dog.bark()`,
  },
  "Canvas Drawing": {
    'HTML': `<canvas id="myCanvas" width="200" height="100" style="border:1px solid #000000;"></canvas>`,
    'JavaScript': `const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 150, 80);`,
  },
};

const helloWorldOutputs: Partial<Record<CodeLanguage, string>> = {
  'JavaScript': 'Hello, World!',
  'Python': 'Hello, World!',
  'TypeScript': 'Hello, World!',
  'Java': 'Hello, World!',
  'C#': 'Hello, World!',
  'C++': 'Hello, World!',
  'Go': 'Hello, World!',
  'Rust': 'Hello, World!',
  'C': 'Hello, World!',
  'Swift': 'Hello, World!',
  'HTML': '<h1>Hello, World!</h1>',
  'CSS': 'The content "Hello, World!" would be displayed on the page.',
  'SQL': 'Hello, World!',
  'Assembly': 'Hello, World!',
  'Lisp': 'Hello, World!',
  'Fortran': ' Hello, World!',
  'COBOL': 'Hello, World!',
  'Pascal': 'Hello, World!',
  'Perl': 'Hello, World!',
  'LOLCODE': 'HAI WORLD!',
  'Whitespace': 'Hello, World!',
  'Brainf*ck': 'Hello World!',
  'ArnoldC': 'Hello World',
  'Shakespeare': 'Hello, World!',
};

interface CodeEditorProps {
  onGenerate: () => boolean;
  usageLeft: number;
}

export default function CodeEditor({ onGenerate, usageLeft }: CodeEditorProps) {
  const { toast } = useToast();
  const [example, setExample] = useState<string>(exampleTypes[0]);
  const [availableExamples, setAvailableExamples] = useState<string[]>([]);
  const [code, setCode] = useState<string>(codeExamples["Hello World"]["JavaScript"] || '');
  const [task, setTask] = useState<CodeTask>('explain');
  const [language, setLanguage] = useState<CodeLanguage>('JavaScript');
  const [aiOutput, setAiOutput] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('ai-output');

  const editorRef = useRef<any>(null);
  const monaco = useMonaco();


  useEffect(() => {
    const examplesForLang = exampleTypes.filter(exType => codeExamples[exType]?.[language] !== undefined);
    setAvailableExamples(examplesForLang);

    let currentExample = example;
    if (!examplesForLang.includes(example)) {
      currentExample = examplesForLang[0] || '';
      setExample(currentExample);
    }

    const newCode = currentExample ? (codeExamples[currentExample]?.[language] || `// No example for ${language}.`) : `// No examples for ${language}.`;
    setCode(newCode);
  }, [language, example]);

  const handleRunCode = async () => {
    setConsoleOutput([]);
    setActiveTab('console-output');

    if (unsupportedLanguages.includes(language)) {
      if (example === "Hello World" && helloWorldOutputs[language]) {
        setConsoleOutput([helloWorldOutputs[language]!]);
      } else {
        setConsoleOutput([
          `Execution for ${language} is not currently supported by our code execution environment (Piston API).`
        ]);
      }
      return;
    }

    setIsExecuting(true);

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: language.toLowerCase(),
          code: code,
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to execute code.');
      }

      const result = await response.json();
      const output = result.output || 'Code executed successfully with no console output.';
      setConsoleOutput(output.split('\n'));

    } catch (error: any) {
      setConsoleOutput([`Error: ${error.message}`]);
      toast({
        title: 'Execution Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
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

    if (!onGenerate()) return;

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4 bg-card">
      {/* Editor Panel */}
      <div className="flex flex-col gap-4 h-full">
        <div className="relative flex-grow font-mono text-lg rounded-lg bg-black/30 border border-gray-700 overflow-hidden min-h-[400px]">
          <Editor
            height="100%"
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={(editor) => { editorRef.current = editor; editor.focus(); }}
            language={language.toLowerCase()}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 }
            }}
          />
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
          <Button onClick={handleRunCode} variant="secondary" className="w-full" disabled={isExecuting || loading}>
            {isExecuting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />} Run Code
          </Button>
          <Button onClick={handleSubmit} disabled={loading || isExecuting || usageLeft <= 0} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {usageLeft > 0 ? 'Run AI Task' : 'Limit Reached'}
          </Button>
        </div>
      </div>

      {/* Output Panel */}
      <div className="flex flex-col border border-border rounded-md shadow-inner overflow-hidden h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col h-full bg-black/30">
          <TabsList className="m-2 shrink-0 grid w-full grid-cols-2 bg-muted/30">
            <TabsTrigger value="ai-output">
              <Wand2 className="mr-2 h-4 w-4" /> AI Output
            </TabsTrigger>
            <TabsTrigger value="console-output">
              <Terminal className="mr-2 h-4 w-4" /> Console
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ai-output" className="flex-grow overflow-auto mt-0">
            <ScrollArea className="h-full">
              <div className="p-4 h-full">
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
          <TabsContent value="console-output" className="flex-grow overflow-auto mt-0">
            <ScrollArea className="h-full">
              <div className="p-4 h-full font-mono text-xs text-foreground">
                {isExecuting ? (
                  <div className="flex items-center justify-center h-full flex-col gap-4 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Executing code...</p>
                  </div>
                ) : consoleOutput.length > 0 ? (
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
