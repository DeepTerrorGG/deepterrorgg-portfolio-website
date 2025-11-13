
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
      'JavaScript': 'function isPrime(num) {\n  if (num <= 1) return false;\n  for (let i = 2; i * i <= num; i++) {\n    if (num % i === 0) return false;\n  }\n  return true;\n}\n\nconsole.log(isPrime(29)); // true\nconsole.log(isPrime(10)); // false',
      'Python': 'def is_prime(num):\n    if num <= 1:\n        return False\n    for i in range(2, int(num**0.5) + 1):\n        if num % i == 0:\n            return False\n    return True\n\nprint(is_prime(29)) # True\nprint(is_prime(10)) # False',
      'TypeScript': 'function isPrime(num: number): boolean {\n  if (num <= 1) return false;\n  for (let i = 2; i * i <= num; i++) {\n    if (num % i === 0) return false;\n  }\n  return true;\n}\n\nconsole.log(isPrime(29)); // true\nconsole.log(isPrime(10)); // false',
      'Java': 'class PrimeCheck {\n    static boolean isPrime(int num) {\n        if (num <= 1) return false;\n        for (int i = 2; i * i <= num; i++) {\n            if (num % i == 0) return false;\n        }\n        return true;\n    }\n\n    public static void main(String[] args) {\n        System.out.println("Is 29 prime? " + isPrime(29));\n        System.out.println("Is 10 prime? " + isPrime(10));\n    }\n}',
      'C#': 'using System;\n\npublic class PrimeCheck {\n    public static bool IsPrime(int number) {\n        if (number <= 1) return false;\n        for (int i = 2; i * i <= number; i++) {\n            if (number % i == 0) return false;\n        }\n        return true;\n    }\n\n    public static void Main() {\n        Console.WriteLine($"Is 29 prime? {IsPrime(29)}");\n        Console.WriteLine($"Is 10 prime? {IsPrime(10)}");\n    }\n}',
      'C++': '#include <iostream>\n#include <cmath>\n\nbool isPrime(int n) {\n    if (n <= 1) return false;\n    for (int i = 2; i <= sqrt(n); i++) {\n        if (n % i == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    std::cout << "Is 29 prime? " << std::boolalpha << isPrime(29) << std::endl;\n    std::cout << "Is 10 prime? " << std::boolalpha << isPrime(10) << std::endl;\n    return 0;\n}',
      'Go': 'package main\n\nimport (\n    "fmt"\n    "math"\n)\n\nfunc isPrime(num int) bool {\n    if num <= 1 {\n        return false\n    }\n    sqrtNum := int(math.Sqrt(float64(num)))\n    for i := 2; i <= sqrtNum; i++ {\n        if num%i == 0 {\n            return false\n        }\n    }\n    return true\n}\n\nfunc main() {\n    fmt.Println("Is 29 prime?", isPrime(29))\n    fmt.Println("Is 10 prime?", isPrime(10))\n}',
      'Rust': 'fn is_prime(n: u32) -> bool {\n    if n <= 1 {\n        return false;\n    }\n    let sqrt = (n as f64).sqrt() as u32;\n    for i in 2..=sqrt {\n        if n % i == 0 {\n            return false;\n        }\n    }\n    true\n}\n\nfn main() {\n    println!("Is 29 prime? {}", is_prime(29));\n    println!("Is 10 prime? {}", is_prime(10));\n}',
      'C': '#include <stdio.h>\n#include <stdbool.h>\n#include <math.h>\n\nbool isPrime(int n) {\n    if (n <= 1) return false;\n    for (int i = 2; i <= sqrt(n); i++) {\n        if (n % i == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    printf("29 is prime: %s\\n", isPrime(29) ? "true" : "false");\n    printf("10 is prime: %s\\n", isPrime(10) ? "true" : "false");\n    return 0;\n}',
      'Swift': 'import Foundation\n\nfunc isPrime(_ n: Int) -> Bool {\n    guard n > 1 else { return false }\n    let max = Int(sqrt(Double(n)))\n    guard max > 1 else { return true }\n    for i in 2...max {\n        if n % i == 0 { return false }\n    }\n    return true;\n}\n\nprint("Is 29 prime? \\(isPrime(29))")\nprint("Is 10 prime? \\(isPrime(10))")',
      'Perl': 'sub is_prime {\n    my $num = shift;\n    return 0 if $num <= 1;\n    for my $i (2..sqrt($num)) {\n        return 0 if $num % $i == 0;\n    }\n    return 1;\n}\n\nprint "Is 29 prime? ", is_prime(29), "\\n";\nprint "Is 10 prime? ", is_prime(10), "\\n";',
      'Assembly': '; Checks if a number (e.g., 29) is prime\n; Linux 64-bit, NASM\n\nsection .data\n    num_to_check equ 29\n    is_prime_msg db "Is prime", 10\n    is_prime_len equ $ - is_prime_msg\n    not_prime_msg db "Not prime", 10\n    not_prime_len equ $ - not_prime_msg\n\nsection .text\n    global _start\n\n_start:\n    mov rdi, num_to_check\n    call check_prime\n    \n    cmp rax, 1\n    je .prime\n\n.not_prime:\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, not_prime_msg\n    mov rdx, not_prime_len\n    syscall\n    jmp .exit\n\n.prime:\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, is_prime_msg\n    mov rdx, is_prime_len\n    syscall\n\n.exit:\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n\n; Function to check if a number in RDI is prime\n; Returns 1 in RAX if prime, 0 otherwise\ncheck_prime:\n    cmp rdi, 1\n    jle .fail         ; Numbers <= 1 are not prime\n    cmp rdi, 3\n    jle .success      ; 2 and 3 are prime\n    mov rax, rdi\n    mov rbx, 2\n    div rbx           ; rax = rdi / 2, rdx = rdi % 2\n    cmp rdx, 0\n    je .fail          ; Divisible by 2\n\n    mov rbx, 3        ; Start checking from 3\n.loop:\n    mov rax, rdi      ; Dividend\n    div rbx           ; RAX = RDI / RBX\n    cmp rdx, 0\n    je .fail          ; Divisible, not prime\n    add rbx, 2        ; Check next odd number\n    mov rax, rbx\n    mul rax           ; RAX = RBX * RBX\n    cmp rax, rdi      ; if (i*i > num) then prime\n    jg .success\n    jmp .loop\n\n.success:\n    mov rax, 1\n    ret\n.fail:\n    mov rax, 0\n    ret',
  },
  "Palindrome Check": {
      'JavaScript': 'function isPalindrome(str) {\n  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, \'\');\n  const reversedStr = cleanStr.split(\'\').reverse().join(\'\');\n  return cleanStr === reversedStr;\n}\n\nconsole.log(isPalindrome("A man, a plan, a canal: Panama")); // true',
      'Python': 'def is_palindrome(s):\n    s = "".join(filter(str.isalnum, s)).lower()\n    return s == s[::-1]\n\nprint(is_palindrome("A man, a plan, a canal: Panama")) # True',
      'TypeScript': 'function isPalindrome(str: string): boolean {\n  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, \'\');\n  const reversedStr = cleanStr.split(\'\').reverse().join(\'\');\n  return cleanStr === reversedStr;\n}\n\nconsole.log(isPalindrome("A man, a plan, a canal: Panama")); // true',
      'Java': 'class Palindrome {\n    static boolean isPalindrome(String str) {\n        String cleanStr = str.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();\n        String reversedStr = new StringBuilder(cleanStr).reverse().toString();\n        return cleanStr.equals(reversedStr);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(isPalindrome("A man, a plan, a canal: Panama"));\n    }\n}',
      'C#': 'using System;\nusing System.Text.RegularExpressions;\n\npublic class PalindromeChecker {\n    public static bool IsPalindrome(string str) {\n        string cleanStr = Regex.Replace(str, "[^a-zA-Z0-9]", "").ToLower();\n        char[] charArray = cleanStr.ToCharArray();\n        Array.Reverse(charArray);\n        return new string(charArray) == cleanStr;\n    }\n\n    public static void Main() {\n        Console.WriteLine(IsPalindrome("A man, a plan, a canal: Panama"));\n    }\n}',
      'C++': '#include <iostream>\n#include <string>\n#include <algorithm>\n#include <cctype>\n\nbool isPalindrome(std::string s) {\n    s.erase(std::remove_if(s.begin(), s.end(), [](char c) { return !std::isalnum(c); }), s.end());\n    std::transform(s.begin(), s.end(), s.begin(), ::tolower);\n    std::string reversed_s = s;\n    std::reverse(reversed_s.begin(), reversed_s.end());\n    return s == reversed_s;\n}\n\nint main() {\n    std::cout << std::boolalpha << isPalindrome("A man, a plan, a canal: Panama") << std::endl;\n}',
      'Go': 'package main\n\nimport (\n\t"fmt"\n\t"unicode"\n)\n\nfunc isPalindrome(s string) bool {\n\trunes := []rune{}\n\tfor _, r := range s {\n\t\tif unicode.IsLetter(r) || unicode.IsNumber(r) {\n\t\t\trunes = append(runes, unicode.ToLower(r))\n\t\t}\n\t}\n\tfor i := 0; i < len(runes)/2; i++ {\n\t\tif runes[i] != runes[len(runes)-1-i] {\n\t\t\treturn false\n\t\t}\n\t}\n\treturn true\n}\n\nfunc main() {\n\tfmt.Println(isPalindrome("A man, a plan, a canal: Panama"))\n}',
      'Rust': 'fn is_palindrome(s: &str) -> bool {\n    let clean: String = s.chars().filter(|c| c.is_alphanumeric()).collect::<String>().to_lowercase();\n    clean == clean.chars().rev().collect::<String>()\n}\n\nfn main() {\n    println!("{}", is_palindrome("A man, a plan, a canal: Panama"));\n}',
      'C': '#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n#include <stdbool.h>\n\nbool isPalindrome(char* s) {\n    int left = 0, right = strlen(s) - 1;\n    while (left < right) {\n        while (left < right && !isalnum(s[left])) left++;\n        while (left < right && !isalnum(s[right])) right--;\n        if (tolower(s[left]) != tolower(s[right])) return false;\n        left++;\n        right--;\n    }\n    return true;\n}\n\nint main() {\n    char str[] = "A man, a plan, a canal: Panama";\n    if (isPalindrome(str)) {\n        printf("Is a palindrome.\\n");\n    } else {\n        printf("Is not a palindrome.\\n");\n    }\n    return 0;\n}',
      'Swift': 'import Foundation\n\nfunc isPalindrome(_ s: String) -> Bool {\n    let clean = s.components(separatedBy: CharacterSet.alphanumerics.inverted).joined().lowercased()\n    return clean == String(clean.reversed())\n}\n\nprint(isPalindrome("A man, a plan, a canal: Panama"))',
  },
  "Fibonacci Sequence": {
      'JavaScript': 'function fibonacci(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}\n\nconsole.log(fibonacci(10)); // 55',
      'Python': 'def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\nprint(fibonacci(10)) # 55',
      'Go': 'package main\n\nimport "fmt"\n\nfunc fibonacci(n int) int {\n\tif n <= 1 {\n\t\treturn n\n\t}\n\ta, b := 0, 1\n\tfor i := 0; i < n; i++ {\n\t\ta, b = b, a+b\n\t}\n\treturn a\n}\n\nfunc main() {\n\tfmt.Println(fibonacci(10))\n}',
      'C': '#include <stdio.h>\n\nint fibonacci(int n) {\n    int a = 0, b = 1, c, i;\n    if (n == 0) return a;\n    for (i = 2; i <= n; i++) {\n        c = a + b;\n        a = b;\n        b = c;\n    }\n    return b;\n}\n\nint main() {\n    printf("%d", fibonacci(10));\n    return 0;\n}',
      'Rust': 'fn fibonacci(n: u32) -> u64 {\n    if n == 0 { return 0; }\n    let mut a = 0;\n    let mut b = 1;\n    for _ in 1..n {\n        let next = a + b;\n        a = b;\n        b = next;\n    }\n    b\n}\n\nfn main() {\n    println!("{}", fibonacci(10));\n}',
      'Java': 'class Fibonacci {\n    public static int fib(int n) {\n        if (n <= 1) return n;\n        int a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n        return b;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(fib(10));\n    }\n}',
      'C#': 'using System;\n\npublic class Fibonacci {\n    public static int Get(int n) {\n        if (n <= 1) return n;\n        int a = 0, b = 1;\n        for (int i = 0; i < n - 1; i++) {\n            int temp = a;\n            a = b;\n            b = temp + b;\n        }\n        return b;\n    }\n\n    public static void Main() {\n        Console.WriteLine(Get(10));\n    }\n}',
  },
  "Tower of Hanoi": {
      'JavaScript': 'function towerOfHanoi(n, fromRod, toRod, auxRod) {\n    if (n === 1) {\n        console.log(`Move disk 1 from rod ${fromRod} to rod ${toRod}`);\n        return;\n    }\n    towerOfHanoi(n - 1, fromRod, auxRod, toRod);\n    console.log(`Move disk ${n} from rod ${fromRod} to rod ${toRod}`);\n    towerOfHanoi(n - 1, auxRod, toRod, fromRod);\n}\n\ntowerOfHanoi(3, \'A\', \'C\', \'B\');',
      'Python': 'def tower_of_hanoi(n, source, destination, auxiliary):\n    if n == 1:\n        print(f"Move disk 1 from {source} to {destination}")\n        return\n    tower_of_hanoi(n-1, source, auxiliary, destination)\n    print(f"Move disk {n} from {source} to {destination}")\n    tower_of_hanoi(n-1, auxiliary, destination, source)\n\ntower_of_hanoi(3, "A", "C", "B")',
      'C': '#include <stdio.h>\n \nvoid towerOfHanoi(int n, char from_rod, char to_rod, char aux_rod)\n{\n    if (n == 1)\n    {\n        printf("Move disk 1 from rod %c to rod %c\\n", from_rod, to_rod);\n        return;\n    }\n    towerOfHanoi(n - 1, from_rod, aux_rod, to_rod);\n    printf("Move disk %d from rod %c to rod %c\\n", n, from_rod, to_rod);\n    towerOfHanoi(n - 1, aux_rod, to_rod, from_rod);\n}\n \nint main()\n{\n    int n = 3; // Number of disks\n    towerOfHanoi(n, \'A\', \'C\', \'B\'); \n    return 0;\n}',
      'Go': 'package main\n\nimport "fmt"\n\nfunc towerOfHanoi(n int, from, to, aux string) {\n    if n == 1 {\n        fmt.Printf("Move disk 1 from %s to %s\\n", from, to)\n        return\n    }\n    towerOfHanoi(n-1, from, aux, to)\n    fmt.Printf("Move disk %d from %s to %s\\n", n, from, to)\n    towerOfHanoi(n-1, aux, to, from)\n}\n\nfunc main() {\n    towerOfHanoi(3, "A", "C", "B")\n}',
      'Java': 'class TowerOfHanoi {\n    static void solve(int n, String from, String to, String aux) {\n        if (n == 1) {\n            System.out.println("Move disk 1 from " + from + " to " + to);\n            return;\n        }\n        solve(n - 1, from, aux, to);\n        System.out.println("Move disk " + n + " from " + from + " to " + to);\n        solve(n - 1, aux, to, from);\n    }\n\n    public static void main(String[] args) {\n        solve(3, "A", "C", "B");\n    }\n}',
      'C++': '#include <iostream>\n\nvoid towerOfHanoi(int n, char from_rod, char to_rod, char aux_rod) {\n    if (n == 1) {\n        std::cout << "Move disk 1 from " << from_rod << " to " << to_rod << std::endl;\n        return;\n    }\n    towerOfHanoi(n-1, from_rod, aux_rod, to_rod);\n    std::cout << "Move disk " << n << " from " << from_rod << " to " << to_rod << std::endl;\n    towerOfHanoi(n-1, aux_rod, to_rod, from_rod);\n}\n\nint main() {\n    towerOfHanoi(3, \'A\', \'C\', \'B\');\n    return 0;\n}',
  },
  "Binary Search": {
      'JavaScript': 'function binarySearch(arr, x) {\n    let low = 0;\n    let high = arr.length - 1;\n    while (low <= high) {\n        let mid = Math.floor((low + high) / 2);\n        if (arr[mid] === x) return mid;\n        if (arr[mid] < x) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}\n\nconst arr = [2, 3, 4, 10, 40];\nconsole.log(binarySearch(arr, 10)); // 3',
      'Python': 'def binary_search(arr, x):\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = (high + low) // 2\n        if arr[mid] < x:\n            low = mid + 1\n        elif arr[mid] > x:\n            high = mid - 1\n        else:\n            return mid\n    return -1\n\narr = [2, 3, 4, 10, 40]\nprint(binary_search(arr, 10)) # 3',
      'C': '#include <stdio.h>\n\nint binarySearch(int arr[], int l, int r, int x) {\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (arr[m] == x) return m;\n        if (arr[m] < x) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}\n\nint main() {\n    int arr[] = {2, 3, 4, 10, 40};\n    int n = sizeof(arr) / sizeof(arr[0]);\n    int x = 10;\n    int result = binarySearch(arr, 0, n - 1, x);\n    (result == -1) ? printf("Element not present")\n                   : printf("Element found at index %d", result);\n    return 0;\n}',
      'Java': 'class BinarySearch {\n    int search(int arr[], int x) {\n        int l = 0, r = arr.length - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (arr[m] == x) return m;\n            if (arr[m] < x) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n\n    public static void main(String args[]) {\n        BinarySearch ob = new BinarySearch();\n        int arr[] = {2, 3, 4, 10, 40};\n        System.out.println("Element found at index " + ob.search(arr, 10));\n    }\n}',
      'Go': 'package main\n\nimport "fmt"\n\nfunc binarySearch(arr []int, x int) int {\n    low, high := 0, len(arr)-1\n    for low <= high {\n        mid := (low + high) / 2\n        if arr[mid] == x {\n            return mid\n        } else if arr[mid] < x {\n            low = mid + 1\n        } else {\n            high = mid - 1\n        }\n    }\n    return -1\n}\n\nfunc main() {\n    arr := []int{2, 3, 4, 10, 40}\n    fmt.Println("Found at index:", binarySearch(arr, 10))\n}',
      'Rust': 'fn binary_search(arr: &[i32], x: i32) -> Option<usize> {\n    let mut low = 0;\n    let mut high = arr.len();\n\n    while low < high {\n        let mid = low + (high - low) / 2;\n        match arr[mid].cmp(&x) {\n            std::cmp::Ordering::Less => low = mid + 1,\n            std::cmp::Ordering::Greater => high = mid,\n            std::cmp::Ordering::Equal => return Some(mid),\n        }\n    }\n    None\n}\n\nfn main() {\n    let arr = [2, 3, 4, 10, 40];\n    println!("Found at index: {:?}", binary_search(&arr, 10));\n}',
  },
  "99 Bottles of Beer": {
      'JavaScript': 'for (let i = 99; i > 0; i--) {\n    console.log(`${i} bottle${i > 1 ? "s" : ""} of beer on the wall`);\n    console.log(`${i} bottle${i > 1 ? "s" : ""} of beer`);\n    console.log(`Take one down, pass it around`);\n    const next = i - 1;\n    console.log(`${next === 0 ? "No more" : next} bottle${next !== 1 ? "s" : ""} of beer on the wall`);\n    console.log("----------------")\n}',
      'Python': 'for i in range(99, 0, -1):\n    print(f"{i} bottle{"" if i == 1 else "s"} of beer on the wall,")\n    print(f"{i} bottle{"" if i == 1 else "s"} of beer.")\n    print("Take one down, pass it around,")\n    next_num = i - 1\n    bottle_str = "bottle" if next_num == 1 else "bottles"\n    num_str = str(next_num) if next_num > 0 else "No more"\n    print(f"{num_str} {bottle_str} of beer on the wall.\\n")',
      'LOLCODE': 'HAI 1.2\n\nI HAS A NUMBR ITZ 99\nIM IN YR LOOP UPPIN YR VAR TIL BOTH SAEM VAR AN 1\n    VISIBLE ""\n    VISIBLE SMOOSH I\'Z NUMBR " bottle" AN (BOTH SAEM I\'Z NUMBR AN 1, "", "s") MKAY " of beer on the wall.."\n    VISIBLE SMOOSH I\'Z NUMBR " bottle" AN (BOTH SAEM I\'Z NUMBR AN 1, "", "s") MKAY " of beer.."\n    VISIBLE "ya take one down, ya pass it around,"    \n    VISIBLE SMOOSH (DIFF OF I\'Z NUMBR AN 1) " bottle" AN (BOTH SAEM (DIFF OF I\'Z NUMBR AN 1) AN 1, "", "s") MKAY " of beer on the wall!"\nIM OUTTA YR LOOP\n\nVISIBLE ""\nVISIBLE "No more bottles of beer on the wall, no more bottles of beer."\nVISIBLE "Go to the store and buy some more, 99 bottles of beer on the wall.."\n\nKTHXBYE',
      'C': '#include <stdio.h>\n\nint main() {\n    for (int i = 99; i > 0; i--) {\n        printf("%d bottle%s of beer on the wall, %d bottle%s of beer.\\n", i, (i == 1 ? "" : "s"), i, (i == 1 ? "" : "s"));\n        if (i-1 > 0)\n            printf("Take one down and pass it around, %d bottle%s of beer on the wall.\\n\\n", i - 1, (i - 1 == 1 ? "" : "s"));\n        else \n            printf("Take one down and pass it around, no more bottles of beer on the wall.\\n\\n");\n    }\n    printf("No more bottles of beer on the wall, no more bottles of beer.\\n");\n    printf("Go to the store and buy some more, 99 bottles of beer on the wall.\\n");\n    return 0;\n}',
      'Go': 'package main\n\nimport "fmt"\n\nfunc main() {\n    for i := 99; i > 0; i-- {\n        fmt.Printf("%d bottle%s of beer on the wall, %d bottle%s of beer.\\n", i, s(i), i, s(i))\n        fmt.Printf("Take one down and pass it around, %s of beer on the wall.\\n\\n", next(i-1))\n    }\n}\n\nfunc s(n int) string {\n    if n == 1 {\n        return ""\n    }\n    return "s"\n}\n\nfunc next(n int) string {\n    if n == 0 {\n        return "no more bottles"\n    }\n    return fmt.Sprintf("%d bottle%s", n, s(n))\n}',
      'Java': 'public class Bottles {\n    public static void main(String[] args) {\n        for (int i = 99; i > 0; i--) {\n            System.out.println(i + " " + bottle(i) + " of beer on the wall, " + i + " " + bottle(i) + " of beer.");\n            System.out.println("Take one down, pass it around, " + (i - 1 == 0 ? "no more" : i - 1) + " " + bottle(i - 1) + " of beer on the wall.");\n        }\n    }\n\n    public static String bottle(int n) {\n        return n == 1 ? "bottle" : "bottles";\n    }\n}',
      'ArnoldC': 'IT\'S SHOWTIME\nI\'LL BE BACK 99\nHEY CHRISTMAS TREE i\nYOU SET US UP 99\nSTICK AROUND i\nTALK TO THE HAND i\nTALK TO THE HAND " bottles of beer on the wall"\nTALK TO THE HAND i\nTALK TO THE HAND " bottles of beer"\nTALK TO THE HAND "Take one down, pass it around"\nGET TO THE CHOPPER i\nHERE IS MY INVITATION i\nGET DOWN 1\nENOUGH TALK\nTALK TO THE HAND i\nTALK TO THE HAND " bottles of beer on the wall"\nCHILL\nYOU HAVE BEEN TERMINATED',
  },
  "Cat Program": {
      'C': '#include <stdio.h>\n\nint main(int argc, char *argv[]) {\n    FILE *fp;\n    int c;\n\n    if (argc < 2) {\n        // Read from stdin, write to stdout\n        while ((c = getchar()) != EOF) {\n            putchar(c);\n        }\n    } else {\n        for (int i = 1; i < argc; i++) {\n            fp = fopen(argv[i], "r");\n            if (fp == NULL) {\n                fprintf(stderr, "cat: %s: No such file or directory\\n", argv[i]);\n                continue;\n            }\n            while ((c = fgetc(fp)) != EOF) {\n                putchar(c);\n            }\n            fclose(fp);\n        }\n    }\n    return 0;\n}',
      'Go': 'package main\n\nimport (\n\t"io"\n\t"os"\n)\n\n// To run: go run main.go file1.txt file2.txt\n// Or: echo "hello" | go run main.go\nfunc main() {\n    if len(os.Args) == 1 {\n        io.Copy(os.Stdout, os.Stdin)\n        return\n    }\n    for _, filename := range os.Args[1:] {\n        file, err := os.Open(filename)\n        if err != nil {\n            os.Stderr.WriteString("cat: " + filename + ": No such file or directory\\n")\n            continue\n        }\n        io.Copy(os.Stdout, file)\n        file.Close()\n    }\n}',
      'Rust': 'use std::io::{self, Read, Write};\nuse std::env;\nuse std::fs::File;\n\nfn main() -> io::Result<()> {\n    let args: Vec<String> = env::args().collect();\n    if args.len() == 1 {\n        let mut buffer = String::new();\n        io::stdin().read_to_string(&mut buffer)?;\n        print!("{}", buffer);\n    } else {\n        for filename in &args[1..] {\n            match File::open(filename) {\n                Ok(mut file) => {\n                    let mut contents = String::new();\n                    file.read_to_string(&mut contents)?;\n                    io::stdout().write_all(contents.as_bytes())?;\n                }\n                Err(_) => {\n                    writeln!(io::stderr(), "cat: {}: No such file or directory", filename)?;\n                }\n            }\n        }\n    }\n    Ok(())\n}',
      'Python': 'import sys\n\nif len(sys.argv) == 1:\n    for line in sys.stdin:\n        sys.stdout.write(line)\nelse:\n    for filename in sys.argv[1:]:\n        try:\n            with open(filename, \'r\') as f:\n                sys.stdout.write(f.read())\n        except FileNotFoundError:\n            sys.stderr.write(f"cat: {filename}: No such file or directory\\n")',
      'Perl': '#!/usr/bin/perl\nwhile (<>) {\n    print $_;\n}',
      'Assembly': '; A simple "cat" program for Linux 64-bit (NASM)\n; Usage: ./cat filename.txt\n\nsection .data\n    BUFFER_SIZE equ 1024\n\nsection .bss\n    buffer resb BUFFER_SIZE\n\nsection .text\n    global _start\n\n_start:\n    ; Check for filename argument\n    cmp rsp, 16            ; Check if argc > 1 (stack pointer reflects this)\n    jle .read_stdin\n\n.open_file:\n    ; char** argv is at [rsp+8]\n    mov rdi, [rsp+16]       ; rdi = argv[1]\n    mov rax, 2              ; syscall for open\n    mov rsi, 0              ; O_RDONLY\n    syscall                 ; rax = file descriptor\n\n    cmp rax, 0\n    jl .exit_error          ; Exit if file open failed\n    mov rdi, rax            ; file descriptor for read\n    jmp .read_loop\n\n.read_stdin:\n    xor rdi, rdi            ; file descriptor 0 is stdin\n\n.read_loop:\n    mov rax, 0              ; syscall for read\n    mov rsi, buffer         ; buffer to read into\n    mov rdx, BUFFER_SIZE    ; max bytes to read\n    syscall                 ; rax = bytes read\n\n    cmp rax, 0\n    jle .exit_success       ; If 0 or less, end of file or error\n\n.write_loop:\n    mov rdx, rax            ; number of bytes to write\n    mov rax, 1              ; syscall for write\n    mov rdi, 1              ; file descriptor 1 is stdout\n    mov rsi, buffer         ; buffer to write from\n    syscall\n\n    mov rdi, rbx            ; Restore file descriptor for next read\n    jmp .read_loop\n\n.exit_error:\n    ; You could print an error message here\n    mov rax, 60\n    mov rdi, 1              ; Exit with error code 1\n    syscall\n\n.exit_success:\n    mov rax, 60\n    xor rdi, rdi            ; Exit with code 0\n    syscall',
  },
  "Quine": {
      'JavaScript': 'const s = () => { console.log(`const s = ${s.toString()}; s();`); }; s();',
      'Python': 's = \'s = %r; print(s%%s)\'; print(s%s)',
      'C': '#include <stdio.h>\\nchar*s="#include <stdio.h>%cchar*s=%c%s%c;main(){printf(s,10,34,s,34,10);}%c";main(){printf(s,10,34,s,34,10);}',
      'Go': 'package main;import"fmt";func main(){s:="package main;import%cfmt%c;func main(){s:=%c%s%c;fmt.Printf(s,34,10,34,s,34,10,10)}%c";fmt.Printf(s,34,10,34,s,34,10,10)}',
      'Perl': '$_ = \'$_ = %c%s%c; printf($_,39,$_,$_)\'; printf($_,39,$_,$_)',
      'Brainf*ck': '>++++++++[<+++++++++>-]<.>>+>-[+]++>++>+++[>[->+++<<+++>]<<]>-----.>->+++..>-.<<+[>[+>+]>>]<--------------.>>.>.+++.>>.<<-.>-.>-.<<+<[>[<+>+]<]>.[-]',
  },
  "Simple Web Server": {
      'JavaScript': '// Requires Node.js\nconst http = require(\'http\');\n\nconst hostname = \'127.0.0.1\';\nconst port = 3000;\n\nconst server = http.createServer((req, res) => {\n  res.statusCode = 200;\n  res.setHeader(\'Content-Type\', \'text/plain\');\n  res.end(\'Hello World\');\n});\n\nserver.listen(port, hostname, () => {\n  console.log(`Server running at http://${hostname}:${port}/`);\n});',
      'Python': 'from http.server import BaseHTTPRequestHandler, HTTPServer\n\nhostName = "localhost"\nserverPort = 8080\n\nclass MyServer(BaseHTTPRequestHandler):\n    def do_GET(self):\n        self.send_response(200)\n        self.send_header("Content-type", "text/html")\n        self.end_headers()\n        self.wfile.write(bytes("<html><body><h1>Hello World!</h1></body></html>", "utf-8"))\n\nif __name__ == "__main__":\n    webServer = HTTPServer((hostName, serverPort), MyServer)\n    print("Server started http://%s:%s" % (hostName, serverPort))\n    try:\n        webServer.serve_forever()\n    except KeyboardInterrupt:\n        pass\n    webServer.server_close()\n    print("Server stopped.")',
      'Go': 'package main\n\nimport (\n    "fmt"\n    "log"\n    "net/http"\n)\n\nfunc helloHandler(w http.ResponseWriter, r *http.Request) {\n    fmt.Fprintf(w, "Hello, World!")\n}\n\nfunc main() {\n    http.HandleFunc("/", helloHandler)\n    fmt.Println("Server starting on port 8080...")\n    if err := http.ListenAndServe(":8080", nil); err != nil {\n        log.Fatal(err)\n    }\n}',
      'Rust': '// Needs `actix-web` crate\nuse actix_web::{get, App, HttpResponse, HttpServer, Responder};\n\n#[get("/")]\nasync fn hello() -> impl Responder {\n    HttpResponse::Ok().body("Hello world!")\n}\n\n#[actix_web::main]\nasync fn main() -> std::io::Result<()> {\n    HttpServer::new(|| {\n        App::new().service(hello)\n    })\n    .bind(("127.0.0.1", 8080))?\n    .run()\n    .await\n}',
      'Java': '// Requires a framework like Spring Boot or similar. This is a simple, native example.\nimport com.sun.net.httpserver.HttpServer;\nimport com.sun.net.httpserver.HttpHandler;\nimport com.sun.net.httpserver.HttpExchange;\nimport java.io.IOException;\nimport java.io.OutputStream;\nimport java.net.InetSocketAddress;\n\npublic class SimpleServer {\n    public static void main(String[] args) throws IOException {\n        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);\n        server.createContext("/", new MyHandler());\n        server.setExecutor(null); // creates a default executor\n        server.start();\n        System.out.println("Server started on port 8080");\n    }\n\n    static class MyHandler implements HttpHandler {\n        @Override\n        public void handle(HttpExchange t) throws IOException {\n            String response = "Hello World!";\n            t.sendResponseHeaders(200, response.length());\n            OutputStream os = t.getResponseBody();\n            os.write(response.getBytes());\n            os.close();\n        }\n    }\n}',
      'C#': '// Requires .NET Core SDK\nusing System.IO;\nusing System.Net;\nusing System.Threading.Tasks;\n\nclass Program {\n    static async Task Main(string[] args) {\n        var listener = new HttpListener();\n        listener.Prefixes.Add("http://localhost:8080/");\n        listener.Start();\n        System.Console.WriteLine("Listening on port 8080...");\n\n        while (true) {\n            var context = await listener.GetContextAsync();\n            var response = context.Response;\n            var responseString = "<html><body>Hello world</body></html>";\n            var buffer = System.Text.Encoding.UTF8.GetBytes(responseString);\n            response.ContentLength64 = buffer.Length;\n            var output = response.OutputStream;\n            output.Write(buffer, 0, buffer.Length);\n            output.Close();\n        }\n    }\n}',
  },
  "Simple Class": {
      'JavaScript': 'class Dog {\n  constructor(name) {\n    this.name = name;\n  }\n\n  bark() {\n    console.log(`${this.name} says Woof!`);\n  }\n}\n\nconst myDog = new Dog("Rex");\nmyDog.bark();',
      'Python': 'class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        print(f"{self.name} says Woof!")\n\nmy_dog = Dog("Rex")\nmy_dog.bark()',
      'TypeScript': 'class Dog {\n  public name: string;\n\n  constructor(name: string) {\n    this.name = name;\n  }\n\n  public bark(): void {\n    console.log(`${this.name} says Woof!`);\n  }\n}\n\nconst myDog = new Dog("Rex");\nmyDog.bark();',
      'Java': 'class Dog {\n    String name;\n\n    public Dog(String name) {\n        this.name = name;\n    }\n\n    public void bark() {\n        System.out.println(this.name + " says Woof!");\n    }\n\n    public static void main(String[] args) {\n        Dog myDog = new Dog("Rex");\n        myDog.bark();\n    }\n}',
      'C#': 'using System;\n\npublic class Dog {\n    public string Name { get; set; }\n\n    public Dog(string name) {\n        Name = name;\n    }\n\n    public void Bark() {\n        Console.WriteLine($"{Name} says Woof!");\n    }\n\n    public static void Main(string[] args) {\n        Dog myDog = new Dog("Rex");\n        myDog.Bark();\n    }\n}',
      'C++': '#include <iostream>\n#include <string>\n\nclass Dog {\npublic:\n    std::string name;\n\n    Dog(std::string n) : name(n) {}\n\n    void bark() {\n        std::cout << name << " says Woof!" << std::endl;\n    }\n};\n\nint main() {\n    Dog myDog("Rex");\n    myDog.bark();\n    return 0;\n}',
      'Go': 'package main\n\nimport "fmt"\n\ntype Dog struct {\n\tName string\n}\n\nfunc (d *Dog) Bark() {\n\tfmt.Printf("%s says Woof!\\n", d.Name)\n}\n\nfunc main() {\n\tdog := Dog{Name: "Rex"}\n\tdog.Bark()\n}',
      'Rust': 'struct Dog {\n    name: String,\n}\n\nimpl Dog {\n    fn new(name: &str) -> Dog {\n        Dog { name: name.to_string() }\n    }\n\n    fn bark(&self) {\n        println!("{} says Woof!", self.name);\n    }\n}\n\nfn main() {\n    let my_dog = Dog::new("Rex");\n    my_dog.bark();\n}',
      'Swift': 'class Dog {\n    var name: String\n\n    init(name: String) {\n        self.name = name\n    }\n\n    func bark() {\n        print("\\(name) says Woof!")\n    }\n}\n\nlet myDog = Dog(name: "Rex")\nmyDog.bark()',
      'Perl': 'package Dog;\n\nsub new {\n    my $class = shift;\n    my $name = shift;\n    my $self = { name => $name };\n    bless $self, $class;\n    return $self;\n}\n\nsub bark {\n    my $self = shift;\n    print "$self->{name} says Woof!\\n";\n}\n\npackage main;\nmy $my_dog = Dog->new("Rex");\n$my_dog->bark();',
  },
  "Canvas Drawing": {
      'HTML': '<canvas id="myCanvas" width="200" height="100" style="border:1px solid #000000;"></canvas>\n\n<script>\n  const canvas = document.getElementById("myCanvas");\n  const ctx = canvas.getContext("2d");\n  ctx.fillStyle = "red";\n  ctx.fillRect(10, 10, 150, 80);\n</script>',
      'JavaScript': '// Assuming an HTML file with <canvas id="myCanvas"></canvas>\nconst canvas = document.getElementById("myCanvas");\nconst ctx = canvas.getContext("2d");\n\n// Draw a red rectangle\nctx.fillStyle = "red";\nctx.fillRect(10, 10, 150, 80);\n\n// Draw a blue circle\nctx.beginPath();\nctx.arc(100, 50, 40, 0, 2 * Math.PI);\nctx.fillStyle = "blue";\nctx.fill();',
      'TypeScript': '// Assuming an HTML file with <canvas id="myCanvas"></canvas>\nconst canvas = document.getElementById("myCanvas") as HTMLCanvasElement;\nconst ctx = canvas.getContext("2d");\n\nif (ctx) {\n  // Draw a red rectangle\n  ctx.fillStyle = "red";\n  ctx.fillRect(10, 10, 150, 80);\n\n  // Draw a blue circle\n  ctx.beginPath();\n  ctx.arc(100, 50, 40, 0, 2 * Math.PI);\n  ctx.fillStyle = "blue";\n  ctx.fill();\n}',
  },
};

const consoleOutputs: Record<string, Partial<Record<CodeLanguage, string[]>>> = {
  "Hello World": {
    'JavaScript': ['Hello, World!'],
    'Python': ['Hello, World!'],
    'TypeScript': ['Hello, World!'],
    'Java': ['Hello, World!'],
    'C#': ['Hello, World!'],
    'C++': ['Hello, World!'],
    'Go': ['Hello, World!'],
    'Rust': ['Hello, World!'],
    'C': ['Hello, World!'],
    'Swift': ['Hello, World!'],
    'SQL': ['[{"Hello, World!":"Hello, World!"}]'],
    'Lisp': ['Hello, World!'],
    'Fortran': [' Hello, World!'],
    'COBOL': ['Hello, World!'],
    'Pascal': ['Hello, World!'],
    'Perl': ['Hello, World!'],
    'LOLCODE': ['HAI WORLD!'],
    'Brainf*ck': ['Hello World!'],
    'ArnoldC': ['Hello World'],
    'Assembly': ['Hello, World!'],
    'Shakespeare': ['Hello, world!'],
  },
  "Bubble Sort": {
    'JavaScript': ['[11, 12, 22, 25, 34, 64, 90]'],
    'Python': ['Sorted array is: [11, 12, 22, 25, 34, 64, 90]'],
    'TypeScript': ['[11, 12, 22, 25, 34, 64, 90]'],
    'Java': ['Sorted array: [11, 12, 22, 25, 34, 64, 90]'],
    'C#': ['Sorted array: [11, 12, 22, 25, 34, 64, 90]'],
    'C++': ['Sorted array: 11 12 22 25 34 64 90 '],
    'Go': ['Sorted array: [11 12 22 25 34 64 90]'],
    'Rust': ['Sorted array: [11, 12, 22, 25, 34, 64, 90]'],
    'C': ['Sorted array: \n11 12 22 25 34 64 90 '],
    'Swift': ['[11, 12, 22, 25, 34, 64, 90]'],
    'Perl': ['Sorted array: 11 12 22 25 34 64 90\n'],
    'Pascal': ['Sorted array: \n 11 12 22 25 34 64 90 '],
    'Lisp': ['(11 12 22 25 34 64 90) '],
    'Fortran': [' Sorted array:\n', '          11          12          22          25          34          64          90'],
    'COBOL': ['Sorted Array:', '11', '12', '22', '25', '34', '64', '90'],
  },
  "Factorial": {
    'JavaScript': ['120'],
    'Python': ['120'],
    'TypeScript': ['120'],
    'Java': ['Factorial of 5 is 120'],
    'C#': ['Factorial of 5 is 120'],
    'C++': ['Factorial of 5 is 120'],
    'Go': ['Factorial of 5 is 120'],
    'Rust': ['Factorial of 5 is 120'],
    'C': ['Factorial of 5 = 120'],
    'Swift': ['Factorial of 5 is 120'],
    'Perl': ['Factorial of 5 is 120\n'],
    'Pascal': ['Factorial of 5 is 120'],
    'Lisp': ['Factorial of 5 is 120 '],
    'Fortran': [' Factorial of           5 is          120'],
    'COBOL': ['Factorial of 05 is 00000120'],
  },
  "FizzBuzz": {
    'JavaScript': ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz', '16', '17', 'Fizz', '19', 'Buzz', 'Fizz', '22', '23', 'Fizz', 'Buzz', '26', 'Fizz', '28', '29', 'FizzBuzz', '31', '32', 'Fizz', '34', 'Buzz', 'Fizz', '37', '38', 'Fizz', 'Buzz', '41', 'Fizz', '43', '44', 'FizzBuzz', '46', '47', 'Fizz', '49', 'Buzz', 'Fizz', '52', '53', 'Fizz', 'Buzz', '56', 'Fizz', '58', '59', 'FizzBuzz', '61', '62', 'Fizz', '64', 'Buzz', 'Fizz', '67', '68', 'Fizz', 'Buzz', '71', 'Fizz', '73', '74', 'FizzBuzz', '76', '77', 'Fizz', '79', 'Buzz', 'Fizz', '82', '83', 'Fizz', 'Buzz', '86', 'Fizz', '88', '89', 'FizzBuzz', '91', '92', 'Fizz', '94', 'Buzz', 'Fizz', '97', '98', 'Fizz', 'Buzz'],
    'Python': ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz', '16', '17', 'Fizz', '19', 'Buzz', 'Fizz', '22', '23', 'Fizz', 'Buzz', '26', 'Fizz', '28', '29', 'FizzBuzz', '31', '32', 'Fizz', '34', 'Buzz', 'Fizz', '37', '38', 'Fizz', 'Buzz', '41', 'Fizz', '43', '44', 'FizzBuzz', '46', '47', 'Fizz', '49', 'Buzz', 'Fizz', '52', '53', 'Fizz', 'Buzz', '56', 'Fizz', '58', '59', 'FizzBuzz', '61', '62', 'Fizz', '64', 'Buzz', 'Fizz', '67', '68', 'Fizz', 'Buzz', '71', 'Fizz', '73', '74', 'FizzBuzz', '76', '77', 'Fizz', '79', 'Buzz', 'Fizz', '82', '83', 'Fizz', 'Buzz', '86', 'Fizz', '88', '89', 'FizzBuzz', '91', '92', 'Fizz', '94', 'Buzz', 'Fizz', '97', '98', 'Fizz', 'Buzz'],
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
    'Perl': ['Is 29 prime? 1\n', 'Is 10 prime? 0\n'],
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
      'Perl': ['Rex says Woof!\n'],
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
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
        preRef.current.scrollTop = textareaRef.current.scrollTop;
        preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };


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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4 bg-card">
        {/* Editor Panel */}
        <div className="flex flex-col gap-4">
             <div className="flex-grow flex flex-col border border-border rounded-md shadow-inner relative bg-muted">
                <div className="relative flex-grow font-mono text-sm">
                    <pre ref={preRef} aria-hidden="true" className="absolute inset-0 p-4 m-0 rounded-md pointer-events-none overflow-auto indent-guides">
                        <code className="language-js" dangerouslySetInnerHTML={{ __html: code + '\n' }}></code>
                    </pre>
                    <Textarea
                        ref={textareaRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onScroll={handleScroll}
                        placeholder="Enter your code here..."
                        className="absolute inset-0 p-4 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-transparent caret-white"
                        style={{ tabSize: 2 }}
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
            .indent-guides {
                --guide-color: hsla(var(--border), 0.2);
                --indent-size: 2ch;
                background-color: hsl(var(--muted));
                background-image: repeating-linear-gradient(to right, var(--guide-color) 0, var(--guide-color) 1px, transparent 1px, transparent var(--indent-size));
                background-position: 0 0;
            }
            .language-js .token.string { color: #A5FF90; }
            .language-js .token.keyword { color: #FF92AE; }
            .language-js .token.function { color: #82AAFF; }
            .language-js .token.number { color: #FFC78B; }
            .language-js .token.comment { color: #637777; font-style: italic; }
            .language-js .token.operator { color: #C39AC9; }
            .language-js .token.punctuation { color: #89DDFF; }
            .language-js .token.parameter { color: #FF92AE; font-style: italic; }
        `}</style>
    </div>
  );
}
