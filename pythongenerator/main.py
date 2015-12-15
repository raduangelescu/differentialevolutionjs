__author__ = 'Drakera'

import csv
import math

def drange(start, stop, step):
    r = start
    while r < stop:
    	yield r
        r += step

class fnTypeDef:
    polynomial = 0
    sin = 1
    cos = 2
    tan = 3
    exp = 4

def poly(lst, x):
  n, tmp = 0, 0
  for a in lst:
    tmp = tmp + (a * (x**n))
    n += 1
  return tmp


functions =[ (fnTypeDef.polynomial,[-4,4],1000,[0.6, 0.2, 0.1, 0.0, 0.1],"polinomial_06_02_01_00_01.csv"),
             (fnTypeDef.polynomial,[-4,4],1000,[1, 2, 1, 3, 0], "polinomial_1_2_1_3_0.csv"),
             (fnTypeDef.polynomial,[-4,4],1000,[1, 0, 1, 0, 1], "polinomial_1_0_1_0_1.csv"),
             (fnTypeDef.polynomial,[-4,4],1000,[5, 3, 0, 0, 0], "polinomial_5_3_0_0_0.csv"),
             (fnTypeDef.polynomial,[-4,4],1000,[1, 2, 1, 0, 0], "polinomial_1_2_1_0_0.csv"),
             (fnTypeDef.polynomial,[-4,4],1000,[0, 0, 1, 2, 1], "polinomial_0_0_1_2_1.csv"),
             (fnTypeDef.sin,[-4,4],1000,[0, 0, 0, 0, 0], "sin.csv"),
             (fnTypeDef.cos,[-4,4],1000,[0, 0, 0, 0, 0], "cos.csv"),
             (fnTypeDef.tan,[-1,1],1000,[0, 0, 0, 0, 0], "tan.csv"),
             (fnTypeDef.exp,[-4,4],1000,[0, 0, 0, 0, 0], "exp.csv")]


for func in functions:
    fnType       = func[0]
    fnRange      = func[1]
    fnResolution = func[2]
    fnCoeff      = func[3]
    fnOutput     = func[4]

    file = open(fnOutput, 'wb')
    csvWriter = csv.writer(file)
    data = [['x', 'y']]

    for i in drange(fnRange[0],fnRange[1],float((fnRange[1]-fnRange[0]))/fnResolution):
        x = i
        fnValue = 0.0
        if fnType == fnTypeDef.polynomial:
            fnValue = poly(fnCoeff,x)
        elif fnType == fnTypeDef.sin:
            fnValue = math.sin(x)
        elif fnType == fnTypeDef.cos:
            fnValue = math.cos(x)
        elif fnType == fnTypeDef.tan:
            fnValue = math.tan(x)
        elif fnType == fnTypeDef.exp:
            fnValue = math.exp(x)

        data.append([x,fnValue])
    csvWriter.writerows(data)
    file.close()
