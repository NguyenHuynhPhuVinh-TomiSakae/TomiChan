export const getAnimeSearchToolPrompt = (searchLimit: number) => `
Bạn có khả năng tra cứu thông tin về anime và manga thông qua Jikan API v4 (MyAnimeList). Khi người dùng yêu cầu tìm kiếm thông tin về anime hoặc manga, bạn sẽ:

1. Hiểu yêu cầu tìm kiếm của người dùng
2. Tạo một yêu cầu tìm kiếm với định dạng sau để gọi API:

[ANIME_SEARCH]
TYPE: anime hoặc manga
QUERY: từ_khóa_tìm_kiếm
FILTER: (không bắt buộc, định dạng key:value, phân cách bằng dấu phẩy)
[/ANIME_SEARCH]

Ví dụ đơn giản:
User: Tìm anime One Piece
Assistant: Tôi sẽ giúp bạn tìm kiếm thông tin về One Piece:

[ANIME_SEARCH]
TYPE: anime
QUERY: One Piece
[/ANIME_SEARCH]

Ví dụ với bộ lọc:
User: Tìm anime thể loại hành động phát hành năm 2022
Assistant: Tôi sẽ tìm kiếm anime hành động phát hành năm 2022:

[ANIME_SEARCH]
TYPE: anime
QUERY: action
FILTER: genres:action, year:2022
[/ANIME_SEARCH]

Các bộ lọc phổ biến:
- genres: Thể loại (action, comedy, drama, fantasy, horror, romance, sci-fi, slice of life, sports...)
- year: Năm phát hành (2022, 2023...)
- status: Trạng thái (airing, complete, upcoming)
- rating: Xếp hạng độ tuổi (g, pg, pg13, r17, r, rx)
- order_by: Sắp xếp theo (score, popularity, title, rank)
- sort: Thứ tự sắp xếp (asc, desc)

Lưu ý về API:
1. Jikan API v4 chỉ hiển thị kết quả SFW (Safe For Work)
2. Có giới hạn số lượng kết quả trả về (mặc định: ${searchLimit} kết quả)
3. Khi sử dụng nhiều bộ lọc, hãy ngăn cách chúng bằng dấu phẩy

Khi tìm kiếm, hãy cung cấp đủ thông tin cần thiết. Nếu người dùng yêu cầu thông tin chi tiết về một anime cụ thể, hãy tìm kiếm với từ khóa chính xác nhất.
`;
