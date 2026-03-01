# import requests
# from json import dump
# from threading import Thread
#
# urls = ["https://dummyjson.com/posts", 'https://dummyjson.com/posts', "https://dummyjson.com/posts"]
#
#
# def download_and_save(url, name):
#     response = requests.get(url)
#     data = response.json()
#     with open(name, "w", encoding="utf-8") as f:
#         dump(data, f, indent=4, ensure_ascii=False)
#
#
# threads = []
# num = 0
#
# for url in urls:
#     num += 1
#     proccess = Thread(target=download_and_save, args=(url, f'file{num}.json'))
#     proccess.start()
#     threads.append(proccess)
# for el in threads:
#     el.join()
#
#
# while True:
#     menu = """
#         1) Non
#         2) Desert
#         3) Exit
#     """
#     print(menu)
#
#     x = input('Tanlang: ').strip()
#     non = {'1': ('Yumshoq-non', 1200), '2': ('Qattiq-non', 1300), '3': ('Qora-non', 1400)}
#     desert = {'1': ('Chocolate', 4000), '2': ('Milk', 3000), '3': ('Bruni', 1400)}
#
#     if x == '1':
#         print('--- Nonlar ---')
#         for k, (name, price) in non.items():
#             print(f"{k}) {name} - {price} so'm")
#
#         choice = input('Tanlang (raqam bilan): ').strip()
#         if choice in non:
#             count = input('Nechta olmoqchisiz?: ')
#             if count.isdigit():
#                 count = int(count)
#                 name, price = non[choice]
#                 total = count * price
#                 print(f"Siz {count} ta {name} oldingiz, umumiy summa: {total} so'm\n")
#                 overall = price * total
#                 market = input('Yana savdo qilasizmi: [ha/yoq] ')
#                 if market == 'ha':
#                     print(x)
#                     print(overall)
#                 else:
#                     continue
#             else:
#                 print("Faqat raqam kiriting!\n")
#         else:
#             print("Xato tanladingiz!\n")
#
#     elif x == '2':
#         print('--- Desertlar ---')
#         for k, (name, price) in desert.items():
#             print(f"{k}) {name} - {price} so'm")
#
#         choice = input('Tanlang (raqam bilan): ').strip()
#         if choice in desert:
#             count = input('Nechta olmoqchisiz?: ')
#             if count.isdigit():
#                 count = int(count)
#                 name, price = desert[choice]
#                 total = count * price
#                 print(f"Siz {count} ta {name} oldingiz, umumiy summa: {total} so'm\n")
#             else:
#                 print("Faqat raqam kiriting!\n")
#         else:
#             print("Xato tanladingiz!\n")
#
#     elif x == '3':
#         print("Tashakkur! Dastur tugadi.")
#         break
#
#     else:
#         print("Noto‘g‘ri tanlov, qaytadan urinib ko‘ring.\n")

# x = [1, 2, 3, 4]
# x_even = []
# for i in x:
#     if i % 2 == 0:
#         x_even.append(i)
# print(x_even)

# x = [1, 2, 3, 4]
# x_even = []
# i = 0
# while i < len(x):
#     if x[i] % 2 == 0:
#         x_even.append(x[i])
#     i = i + 1
# print(x_even)

# class Person():
#     def __init__(self, full_name, email, age, location):
#         self.full_name = full_name
#         self.email = email
#         self.age = age
#         self.location = location
#
#     def __str__(self):
#         data = f"Name: {self.full_name}, age: {self.age}"
#         return data
#
#     def check_age(self, age):
#         if age >= 19:
#             data = 'Welcome'
#             return data
#         else:
#             data = 'Failed'
#             return data
#
#     def check_email(self, email):
#         if "@gmail.com" in email and "@" in email and ".com" in email:
#             return 'Email acceptable'
#         else:
#             return 'Email not acceptable'
#
# person1 = Person('Qudratbekh', 'anonshack48@gmail.co', 30, 'Tashkent sh')
# print(person1.__dict__)
#
# # x = ['full_name', 'email']
# # for i in x:
# #     person1.__delattr__(i)
# # print(person1.__dict__)
# print(person1.full_name)
# person_age = person1.age
# x1 = person1.check_age(person_age)
# print(x1)
#
# person_email = person1.email
# x2 = person1.check_email(person_email)
# print(x2)

# l1 = ['cat', 'dog']
# l2 = []
# for i in l1:
#     l2.append(i[::-1])
# print(l2)
#
# print(l1[0])
# print(l1[1])

# x = input('Text: ')
# res = ""
#
# for el in x:
#     if 'a' <= el <= 'z':
#         res += 'a' if el == 'z' else chr(ord(el) + 1)
#     elif 'A' <= el <= 'Z':
#         res += 'A' if el == 'Z' else chr(ord(el) + 1)
#     else:
#         res += el
#
# print(res)



# 0 1 2 3 4 5 6 7 8
# P r o g r a m m a
# juft  → P o r m a
# toq  → r g a m m
# s = input("text: ")
# juft = ""
# toq = ""
# for i in range(len(s)):
#     if i % 2 == 0:
#         juft += s[i]
#     else:
#         toq += s[i]
# res = juft + toq[::-1]
# print("res:", res)

# x = input("Butun son kiriting: ")
# l = []
# while True:
#     for i in x:
#         l.append(i)
#     l.reverse()
#     print("".join(l))
#     break

# f = open('story.txt', 'r')
# word = f.read().lower()
# f.close()
#
# words = word.split() # salom salom salom
#
# res = {}
# for el in words:
#     if el in res:
#         res[el] += 1
#     else:
#         res[el] = 1
#
# kop_soz = max(res)
#
# print(f"Eng kop soz: '{kop_soz}'")
# print(f"Jami {res[kop_soz]} marta")


import time
print("nums (100 -> 100 000 000)")
s_time = time.time()
for el in range(100, 100000001):
    s_son = str(el)
    n = len(s_son)

    res = sum(int(num) ** n for num in s_son)
    if res == el:
        print(f"num: {el}")

end_time = time.time()
print(f"The time took: {int(end_time - s_time)} sek")