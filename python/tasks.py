# misol-1
# text = input('Text: ')
# first_upper_l = False #
# res = ""
# for el in text:
#     if first_upper_l:
#         res += el.upper()
#     else:
#         res += el.lower()
#     first_upper_l = not first_upper_l # True <> False, not False = True, not True = False
# print(res)

# misol-2
# text = input('text: ')
# nums = ""
# for el in text:
#     if el.isdigit():
#         nums = nums + el
#     else:
#         if nums != '': # 1 2
#             print(nums) # 1 2
#             nums = ''
# print(nums)

# usul-2
# text = input('text: ')
# nums = ""
# for el in text:
#     if el.isdigit():
#         nums += el
#
# print(nums)

# misol-3
# l = ["hi", "python", "cat", "developer"]
# for el in l:
#     print(f"{el} -> {len(el)} -> {'*' * len(el)}")

# misol-4
# index_l = input('text: ')
# for el in range(len(index_l)):
#     print(f"{index_l[el]} -> {el}")

# misol-5
# l = ["sun", "apple", "dog", "banana", "tea"]
# res = []
# for el in l:
#     if len(el) >= 4:
#         res.append(el)
#
# for i in res:
#     print(i, end=' ')

# misol-6
# l = ["sun", "apple", "dog", "banana", "tea"]
# for i in l:
#     print(i[::-1])


# misol-7
# text = "mississippi"
# res1 = ""
# res2 = ""
# for el in text:
#     if el not in res1:
#         res1 += el
#     else:
#         res2 += el
# print(res1)
# print(res2)

# misol-8
# usul - 1
# x = "success"
# count = {}
# for el in x:
#     if el in count:
#         count[el] += 1
#     else:
#         count[el] = 1
#
# for k, v in count.items():
#     print(f"{k}: {v}")


# usul-2
# text = "success"
# for ch in text:
#     if text.index(ch) == text.find(ch):
#         count = 0
#         for el in text:
#             if el == ch:
#                 count += 1
#         print(f"{ch}: {count}")

# misol-9
# l = ["red", "blue", "green", "black", "white"]
# res = []
# for el in range(len(l)):
#     if el % 2 == 0:
#         res.append(l[el])
# print(res)


# misol-10
# text = 'anons'
# res = ''
# for i in text:
#     res = res + i
#     print(res)
