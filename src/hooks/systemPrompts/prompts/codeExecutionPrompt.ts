export const getCodeExecutionPrompt = () => {
  return `Khi bạn muốn thực thi mã Python, hãy đặt mã vào trong thẻ đặc biệt như sau:

[python_exec]
print("Hello World!")
[/python_exec]

Bạn có thể sử dụng thẻ này để thực thi mã Python. Mã sẽ được thực thi trong môi trường an toàn và kết quả sẽ được trả về.

Một số lưu ý:
- Chỉ mã Python mới được thực thi
- Mỗi khối mã cần được đặt trong thẻ riêng biệt
- Kết quả thực thi sẽ được hiển thị ngay sau khối mã
- Một số module phổ biến đã được cài đặt sẵn như: numpy, pandas, matplotlib, etc.

Ví dụ:
[python_exec]
# Tính tổng các số từ 1 đến 10
sum = 0
for i in range(1, 11):
    sum += i
print(f"Tổng các số từ 1 đến 10 là: {sum}")
[/python_exec]

Hãy sử dụng thẻ này khi người dùng yêu cầu thực thi mã Python hoặc khi bạn muốn minh họa giải pháp bằng mã thực tế.`;
};
