#import for check of SSN 
import re
import datetime
import math

# Change format     
def format(ssn): 
    t_year = datetime.datetime.now().year

    reg = r"^(\d{2}){0,1}(\d{2})(\d{2})(\d{2})([\-|\+| ]{0,1})?(\d{3})(\d{0,1})$"
    match = re.match(reg, str(ssn))

    cent = match.group(1)
    year = match.group(2)
    month = match.group(3)
    day = match.group(4)
    separator = match.group(5)
    num = match.group(6)
    check = match.group(7)

    if not cent:
        if separator == '+' or t_year - int('20'+year) < 0:
            cent = '19'
        else:
            cent = '20'
    if (int(t_year) - int(cent+year)) > 100: 
        separator = '+'
    else: 
        separator = '-'

    return year+month+day+separator+num+check 

#Check if valid personID 
def check_ssn(ssn):
    t_year = datetime.datetime.now().year
    t_month = datetime.datetime.now().month
    t_day = datetime.datetime.now().day
    isValid = True

    # print(ssn)
    reg = r"^(\d{2}){0,1}(\d{2})(\d{2})(\d{2})([\-|\+| ]{0,1})?(\d{3})(\d{0,1})$"
    match = re.match(reg, str(ssn))

    if not match:
        isValid = False
        print("Inte ett personnummer.")  #(shorter than 10 or longer than 12)
    else:
        cent = match.group(1)
        year = match.group(2)
        month = match.group(3)
        day = match.group(4)
        separator = match.group(5)
        num = match.group(6)
        check = match.group(7)

        if not cent:
            if separator == '+' or t_year - int('20'+year) < 0:
                cent = '19'
            else:
                cent = '20'

        fullyear = cent+year
        _fullyear = int(fullyear)
        _month = int(month)
        _day = int(day)
        _num = int(num)
        _check = int(check)

        #Check valid date
        isValidDate = True
        try:
            datetime.datetime(int(year), int(month), int(day))
        except ValueError:
            isValidDate = False
        if (t_year < _fullyear) or (t_year <= _fullyear and t_month < _month) or (t_year <= _fullyear and t_month <= _month and t_day <= _day): 
            isValidDate = False
        if(not isValidDate):
            isValid = False
            print("Är inte ett giltigt datum.")

        #Kontrollsiffra
        data = year+month+day+num
        calculation = 0
        for i in range(0, len(data)):
            v = int(data[i])
            v *= 2 - (i % 2)
            if v > 9:
                v -= 9
            calculation += v
        luhn = int(math.ceil(float(calculation) / 10) * 10 - float(calculation))
        # print("luhn: " + str(luhn))
        if _check != luhn:
            isValid = False
            print("Fel kontrollsiffra")

        return isValid