package com.mockproject.job_portal.config;

import com.mockproject.job_portal.entity.*;
import com.mockproject.job_portal.entity.enums.*;
import com.mockproject.job_portal.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;

/**
 * Tạo dữ liệu demo phong phú: nhà tuyển dụng, công ty, tin tuyển dụng, ứng viên,
 * đơn ứng tuyển ở mọi trạng thái (kèm lịch phỏng vấn, kết quả, Offer), thông báo và đánh giá.
 *
 * - Chỉ chạy 1 lần: nếu đã có tài khoản DEMO_MARKER_EMAIL thì bỏ qua.
 * - Tài khoản / công ty đã tồn tại (ví dụ recruiter@demo.com, FPT Software) được dùng lại, không tạo trùng.
 * - Tất cả tài khoản demo có mật khẩu 123456.
 * - Chạy trong 1 transaction: lỗi giữa chừng thì không lưu gì cả.
 */
@Component
public class DemoDataSeeder {

    private static final String DEMO_MARKER_EMAIL = "hr.paynest@demo.com";
    private static final String DEMO_PASSWORD = "123456";
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobListingRepository jobListingRepository;
    private final IndustryRepository industryRepository;
    private final JobTypeRepository jobTypeRepository;
    private final CandidateProfileRepository profileRepository;
    private final JobApplicationRepository applicationRepository;
    private final ShortlistRepository shortlistRepository;
    private final InterviewSlotRepository interviewSlotRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final OfferRepository offerRepository;
    private final NotificationRepository notificationRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    // Mốc thời gian lúc chạy seed, dùng để tính "x ngày trước"
    private LocalDateTime now;

    public DemoDataSeeder(UserRepository userRepository,
                          CompanyRepository companyRepository,
                          JobListingRepository jobListingRepository,
                          IndustryRepository industryRepository,
                          JobTypeRepository jobTypeRepository,
                          CandidateProfileRepository profileRepository,
                          JobApplicationRepository applicationRepository,
                          ShortlistRepository shortlistRepository,
                          InterviewSlotRepository interviewSlotRepository,
                          InterviewFeedbackRepository feedbackRepository,
                          OfferRepository offerRepository,
                          NotificationRepository notificationRepository,
                          ReviewRepository reviewRepository,
                          PasswordEncoder passwordEncoder,
                          JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.jobListingRepository = jobListingRepository;
        this.industryRepository = industryRepository;
        this.jobTypeRepository = jobTypeRepository;
        this.profileRepository = profileRepository;
        this.applicationRepository = applicationRepository;
        this.shortlistRepository = shortlistRepository;
        this.interviewSlotRepository = interviewSlotRepository;
        this.feedbackRepository = feedbackRepository;
        this.offerRepository = offerRepository;
        this.notificationRepository = notificationRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void seed() {
        if (userRepository.existsByEmail(DEMO_MARKER_EMAIL)) {
            return; // dữ liệu demo đã có
        }
        now = LocalDateTime.now();

        /* ==================== 1. Ngành nghề bổ sung ==================== */
        industry("Logistics & Chuỗi cung ứng", "Xuất nhập khẩu, kho vận, vận tải");
        industry("Nhân sự & Hành chính", "Tuyển dụng, C&B, hành chính văn phòng");
        industry("Giáo dục & Đào tạo", "Giảng dạy, tư vấn tuyển sinh, đào tạo doanh nghiệp");

        /* ==================== 2. Nhà tuyển dụng & công ty ==================== */
        User fptRecruiter = user("recruiter@demo.com", "Trần Nhà Tuyển Dụng", "0901000001", Role.RECRUITER, 60);
        User payNestHr = user(DEMO_MARKER_EMAIL, "Phạm Thu Hà", "0901000002", Role.RECRUITER, 55);
        User tvbHr = user("hr.tvbdigital@demo.com", "Lê Quang Huy", "0901000003", Role.RECRUITER, 50);
        User choXanhHr = user("hr.choxanh@demo.com", "Đỗ Minh Châu", "0901000004", Role.RECRUITER, 48);
        User haiDangHr = user("hr.haidang@demo.com", "Vũ Thanh Sơn", "0901000005", Role.RECRUITER, 45);
        User bloomHr = user("hr.bloom@demo.com", "Trịnh Ngọc Anh", "0901000006", Role.RECRUITER, 40);
        User loTrinhHr = user("hr.lotrinh@demo.com", "Nguyễn Hoài Nam", "0901000007", Role.RECRUITER, 35);

        Company fpt = companyRepository.findByName("FPT Software").orElseGet(() -> createFptWithBaseJobs(fptRecruiter));
        Company bienXanh = company(fptRecruiter, "Biển Xanh Software", "https://bienxanh.example.com",
                "Công ty gia công phần mềm cho thị trường Nhật Bản, hơn 300 kỹ sư tại Đà Nẵng. Môi trường trẻ, quy trình Agile/Scrum.",
                "Đà Nẵng", "Tầng 5, tòa nhà Software Park, 02 Quang Trung, Hải Châu");
        Company payNest = company(payNestHr, "PayNest Fintech", "https://paynest.example.com",
                "Ví điện tử và giải pháp thanh toán cho hơn 5 triệu người dùng. Chúng tôi xây dựng sản phẩm tài chính đơn giản, an toàn cho mọi người.",
                "Hồ Chí Minh", "Tầng 12, 51 Nguyễn Văn Linh, Quận 7",
                "Hà Nội", "Tầng 8, 22 Láng Hạ, Đống Đa");
        Company tvb = company(tvbHr, "Ngân hàng số Tâm Việt (TVB Digital)", "https://tvbdigital.example.com",
                "Ngân hàng số thế hệ mới: mở tài khoản online trong 5 phút, cho vay tiêu dùng và giải pháp tài chính cho doanh nghiệp vừa và nhỏ.",
                "Hà Nội", "68 Bà Triệu, Hoàn Kiếm");
        Company choXanh = company(choXanhHr, "Chợ Xanh Commerce", "https://choxanh.example.com",
                "Sàn thương mại điện tử nông sản sạch, kết nối trực tiếp nông trại với người tiêu dùng, giao hàng trong 2 giờ tại TP.HCM.",
                "Hồ Chí Minh", "120 Cộng Hòa, Tân Bình");
        Company haiDang = company(haiDangHr, "Hải Đăng Logistics", "https://haidang.example.com",
                "Dịch vụ giao nhận vận tải quốc tế, khai báo hải quan và kho bãi với hệ thống chi nhánh tại các cảng lớn.",
                "Hải Phòng", "15 Lê Hồng Phong, Ngô Quyền",
                "Hồ Chí Minh", "Kho Cát Lái, Nguyễn Thị Định, TP. Thủ Đức");
        Company bloom = company(bloomHr, "Bloom Creative Studio", "https://bloomstudio.example.com",
                "Agency sáng tạo chuyên branding, social media và sản xuất nội dung cho các thương hiệu tiêu dùng.",
                "Hồ Chí Minh", "36 Nguyễn Đình Chiểu, Quận 1",
                "Đà Nẵng", "88 Bạch Đằng, Hải Châu");
        Company loTrinh = company(loTrinhHr, "Lộ Trình Education", "https://lotrinh.example.com",
                "Hệ thống trung tâm luyện thi IELTS và kỹ năng mềm với 12 cơ sở trên toàn quốc.",
                "Hà Nội", "25 Xuân Thủy, Cầu Giấy",
                "Cần Thơ", "50 Trần Văn Khéo, Ninh Kiều");

        /* ==================== 3. Tin tuyển dụng ==================== */
        // FPT Software (thêm vào 3 tin có sẵn)
        JobListing fptDevops = job(fpt, "Công nghệ thông tin (IT)", "Full-time", "DevOps Engineer (AWS/Kubernetes)",
                "25,000,000 - 40,000,000 VNĐ", JobStatus.OPEN, 16,
                "- Xây dựng, vận hành hạ tầng AWS cho dự án khách hàng Mỹ\n- Thiết lập CI/CD với GitLab CI, ArgoCD\n- Giám sát hệ thống bằng Prometheus, Grafana",
                "- Tối thiểu 2 năm kinh nghiệm DevOps\n- Thành thạo Docker, Kubernetes, Terraform\n- Có chứng chỉ AWS là lợi thế",
                "- Thưởng dự án theo quý\n- Hỗ trợ thi chứng chỉ AWS\n- 15 ngày phép/năm");
        JobListing fptBa = job(fpt, "Công nghệ thông tin (IT)", "Hybrid", "Business Analyst",
                "18,000,000 - 30,000,000 VNĐ", JobStatus.OPEN, 14,
                "- Làm việc với khách hàng để thu thập, phân tích yêu cầu\n- Viết tài liệu SRS, user story, vẽ wireframe\n- Phối hợp với đội phát triển và kiểm thử",
                "- Tối thiểu 1 năm kinh nghiệm BA\n- Tiếng Anh giao tiếp tốt\n- Biết sử dụng Jira, Figma",
                "- Làm việc Hybrid 2 ngày/tuần tại nhà\n- Lương tháng 13, thưởng hiệu suất");
        JobListing fptIntern = job(fpt, "Công nghệ thông tin (IT)", "Thực tập sinh (Internship)", "Thực tập sinh Lập trình Java",
                "4,000,000 - 6,000,000 VNĐ", JobStatus.OPEN, 3,
                "- Tham gia khóa đào tạo Java Spring Boot 2 tháng\n- Thực hành dự án nội bộ cùng mentor",
                "- Sinh viên năm 3, 4 ngành CNTT\n- Nắm vững OOP, SQL cơ bản",
                "- Cơ hội trở thành nhân viên chính thức\n- Phụ cấp thực tập hằng tháng");

        // Biển Xanh Software
        JobListing bxFlutter = job(bienXanh, "Công nghệ thông tin (IT)", "Full-time", "Flutter Mobile Developer",
                "18,000,000 - 32,000,000 VNĐ", JobStatus.OPEN, 10,
                "- Phát triển ứng dụng di động đa nền tảng bằng Flutter\n- Tích hợp REST API, Firebase\n- Tối ưu hiệu năng ứng dụng",
                "- Tối thiểu 1 năm kinh nghiệm Flutter/Dart\n- Hiểu về state management (Bloc, Provider)",
                "- Lương tháng 13, 14\n- Khám sức khỏe định kỳ\n- Team building 2 lần/năm");
        job(bienXanh, "Công nghệ thông tin (IT)", "Remote", "Senior .NET Developer",
                null, JobStatus.OPEN, 15,
                "- Thiết kế và phát triển hệ thống ERP cho khách hàng Nhật\n- Review code, hướng dẫn thành viên mới",
                "- Tối thiểu 4 năm kinh nghiệm C#, ASP.NET Core\n- Có kinh nghiệm SQL Server, Azure",
                "- Làm việc 100% từ xa\n- Lương thỏa thuận theo năng lực");
        JobListing bxPm = job(bienXanh, "Công nghệ thông tin (IT)", "Full-time", "Project Manager (Tiếng Nhật N2)",
                "35,000,000 - 55,000,000 VNĐ", JobStatus.CLOSED, 34,
                "- Quản lý dự án gia công phần mềm cho khách hàng Nhật\n- Lập kế hoạch, theo dõi tiến độ, báo cáo khách hàng",
                "- Tiếng Nhật N2 trở lên\n- Tối thiểu 3 năm quản lý dự án phần mềm",
                "- Phụ cấp tiếng Nhật\n- Công tác Nhật Bản ngắn hạn");

        // PayNest Fintech
        JobListing pnGolang = job(payNest, "Công nghệ thông tin (IT)", "Hybrid", "Backend Engineer (Golang)",
                "30,000,000 - 50,000,000 VNĐ", JobStatus.OPEN, 18,
                "- Phát triển microservice thanh toán chịu tải cao\n- Thiết kế API, tối ưu truy vấn PostgreSQL\n- Viết unit test, tham gia on-call",
                "- Tối thiểu 2 năm kinh nghiệm Golang hoặc Java\n- Hiểu về Kafka, Redis\n- Có kinh nghiệm hệ thống thanh toán là lợi thế",
                "- Thưởng cổ phiếu (ESOP)\n- Bảo hiểm sức khỏe cao cấp cho cả gia đình");
        JobListing pnRisk = job(payNest, "Tài chính & Ngân hàng", "Full-time", "Chuyên viên Quản trị Rủi ro",
                "20,000,000 - 30,000,000 VNĐ", JobStatus.OPEN, 7,
                "- Xây dựng quy tắc phát hiện giao dịch gian lận\n- Phân tích dữ liệu giao dịch, báo cáo rủi ro hằng tuần",
                "- Tốt nghiệp chuyên ngành Tài chính, Kinh tế, Toán\n- Thành thạo Excel, SQL",
                "- Lương tháng 13\n- Đào tạo chứng chỉ FRM");
        JobListing pnDesigner = job(payNest, "Thiết kế & Đồ họa", "Hybrid", "Product Designer (UI/UX)",
                "22,000,000 - 35,000,000 VNĐ", JobStatus.OPEN, 11,
                "- Thiết kế trải nghiệm cho ứng dụng ví điện tử\n- Nghiên cứu người dùng, kiểm thử prototype\n- Xây dựng design system",
                "- Tối thiểu 2 năm kinh nghiệm thiết kế sản phẩm số\n- Có portfolio ứng dụng mobile\n- Thành thạo Figma",
                "- MacBook Pro\n- Ngân sách học tập 10 triệu/năm");

        // TVB Digital
        JobListing tvbAccountant = job(tvb, "Tài chính & Ngân hàng", "Full-time", "Chuyên viên Kế toán Tổng hợp",
                "15,000,000 - 22,000,000 VNĐ", JobStatus.OPEN, 25,
                "- Hạch toán, đối chiếu số liệu kế toán\n- Lập báo cáo tài chính tháng, quý\n- Làm việc với kiểm toán độc lập",
                "- Tốt nghiệp chuyên ngành Kế toán, Kiểm toán\n- Tối thiểu 2 năm kinh nghiệm\n- Có chứng chỉ kế toán trưởng là lợi thế",
                "- Lương tháng 13, thưởng KPI\n- Lãi suất vay ưu đãi cho nhân viên");
        JobListing tvbSales = job(tvb, "Bán hàng & Kinh doanh", "Full-time", "Chuyên viên Khách hàng Doanh nghiệp",
                "14,000,000 - 25,000,000 VNĐ + thưởng doanh số", JobStatus.OPEN, 12,
                "- Tìm kiếm, phát triển khách hàng doanh nghiệp vừa và nhỏ\n- Tư vấn sản phẩm tín dụng, tài khoản thanh toán",
                "- Tối thiểu 1 năm kinh nghiệm bán hàng B2B\n- Kỹ năng đàm phán tốt",
                "- Thưởng doanh số không giới hạn\n- Lộ trình thăng tiến rõ ràng");
        JobListing tvbData = job(tvb, "Công nghệ thông tin (IT)", "Full-time", "Data Analyst",
                "20,000,000 - 32,000,000 VNĐ", JobStatus.OPEN, 20,
                "- Phân tích hành vi khách hàng trên ứng dụng ngân hàng số\n- Xây dựng dashboard Power BI cho ban điều hành",
                "- Thành thạo SQL, Python (pandas)\n- Có tư duy phân tích, trình bày tốt",
                "- Môi trường làm việc với dữ liệu lớn\n- 14 ngày phép/năm");

        // Chợ Xanh Commerce
        JobListing cxMarketing = job(choXanh, "Marketing & Truyền thông", "Full-time", "Digital Marketing Executive",
                "12,000,000 - 18,000,000 VNĐ", JobStatus.OPEN, 9,
                "- Lên kế hoạch và chạy quảng cáo Facebook, Google\n- Theo dõi, tối ưu chi phí trên mỗi đơn hàng",
                "- Tối thiểu 1 năm kinh nghiệm chạy quảng cáo\n- Biết dùng Google Analytics",
                "- Thưởng theo hiệu quả chiến dịch\n- Giảm giá 20% khi mua hàng trên sàn");
        JobListing cxContent = job(choXanh, "Marketing & Truyền thông", "Part-time", "Content Creator (TikTok/Video ngắn)",
                "8,000,000 - 12,000,000 VNĐ", JobStatus.OPEN, 6,
                "- Lên ý tưởng, quay dựng video ngắn về nông sản\n- Quản lý kênh TikTok của công ty",
                "- Có kênh cá nhân hoặc sản phẩm video đã thực hiện\n- Biết dùng CapCut, Premiere",
                "- Làm việc 4 tiếng/ngày, linh hoạt thời gian");
        job(choXanh, "Logistics & Chuỗi cung ứng", "Full-time", "Trưởng nhóm Vận hành Kho",
                "18,000,000 - 25,000,000 VNĐ", JobStatus.OPEN, 13,
                "- Quản lý 15 nhân viên kho, sắp xếp ca làm việc\n- Kiểm soát nhập - xuất - tồn hằng ngày",
                "- Tối thiểu 2 năm ở vị trí quản lý kho\n- Biết sử dụng phần mềm WMS",
                "- Phụ cấp ca đêm\n- Bảo hiểm đầy đủ");
        JobListing cxSupport = job(choXanh, "Bán hàng & Kinh doanh", "Part-time", "Nhân viên Chăm sóc Khách hàng",
                "9,000,000 - 12,000,000 VNĐ", JobStatus.CLOSED, 40,
                "- Trả lời khách hàng qua hotline, chat\n- Xử lý đổi trả, khiếu nại",
                "- Giọng nói dễ nghe, kiên nhẫn\n- Không yêu cầu kinh nghiệm",
                "- Được đào tạo từ đầu\n- Xoay ca linh hoạt");

        // Hải Đăng Logistics
        JobListing hdImport = job(haiDang, "Logistics & Chuỗi cung ứng", "Full-time", "Chuyên viên Xuất nhập khẩu",
                "13,000,000 - 20,000,000 VNĐ", JobStatus.OPEN, 4,
                "- Chuẩn bị chứng từ xuất nhập khẩu, khai báo hải quan điện tử\n- Theo dõi lô hàng, liên hệ hãng tàu",
                "- Tốt nghiệp Ngoại thương, Logistics\n- Tiếng Anh đọc hiểu chứng từ",
                "- Thưởng theo số lô hàng\n- Phụ cấp xăng xe, điện thoại");
        job(haiDang, "Logistics & Chuỗi cung ứng", "Full-time", "Điều phối Vận tải",
                "12,000,000 - 16,000,000 VNĐ", JobStatus.OPEN, 10,
                "- Lập kế hoạch điều xe giao hàng\n- Theo dõi hành trình, xử lý sự cố trên đường",
                "- Có kinh nghiệm điều phối là lợi thế\n- Thành thạo Excel",
                "- Thu nhập ổn định, đóng bảo hiểm đầy đủ");
        JobListing hdRecruiter = job(haiDang, "Nhân sự & Hành chính", "Full-time", "Chuyên viên Tuyển dụng (HR)",
                "12,000,000 - 18,000,000 VNĐ", JobStatus.OPEN, 8,
                "- Đăng tin, sàng lọc hồ sơ, phỏng vấn sơ bộ\n- Tổ chức ngày hội việc làm tại các trường đại học",
                "- Tối thiểu 1 năm kinh nghiệm tuyển dụng\n- Giao tiếp tốt",
                "- Thưởng theo số lượng tuyển thành công");

        // Bloom Creative Studio
        JobListing blGraphic = job(bloom, "Thiết kế & Đồ họa", "Full-time", "Graphic Designer",
                "12,000,000 - 20,000,000 VNĐ", JobStatus.OPEN, 17,
                "- Thiết kế bộ nhận diện thương hiệu, ấn phẩm quảng cáo\n- Phối hợp với team content cho chiến dịch social",
                "- Thành thạo Illustrator, Photoshop\n- Có portfolio cá nhân",
                "- Không gian làm việc sáng tạo\n- Thứ 6 về sớm 1 tiếng");
        JobListing blSocial = job(bloom, "Marketing & Truyền thông", "Hybrid", "Social Media Planner",
                "14,000,000 - 22,000,000 VNĐ", JobStatus.OPEN, 9,
                "- Lên kế hoạch nội dung hằng tháng cho 3 - 4 thương hiệu\n- Đo lường, báo cáo hiệu quả kênh",
                "- Tối thiểu 1 năm kinh nghiệm social media\n- Viết content tốt",
                "- Làm việc Hybrid\n- Ngân sách học khóa học online");
        job(bloom, "Thiết kế & Đồ họa", "Thực tập sinh (Internship)", "Thực tập sinh Thiết kế",
                "3,000,000 - 5,000,000 VNĐ", JobStatus.OPEN, 1,
                "- Hỗ trợ thiết kế ấn phẩm social\n- Tham gia buổi brainstorm cùng team",
                "- Sinh viên ngành Thiết kế đồ họa, Mỹ thuật\n- Biết dùng Photoshop hoặc Figma",
                "- Có xác nhận thực tập\n- Cơ hội làm nhân viên chính thức");

        // Lộ Trình Education
        job(loTrinh, "Giáo dục & Đào tạo", "Part-time", "Giáo viên Tiếng Anh (IELTS 7.0+)",
                "250,000 - 400,000 VNĐ/giờ", JobStatus.OPEN, 3,
                "- Giảng dạy lớp IELTS 10 - 15 học viên\n- Chấm bài Writing, Speaking cho học viên",
                "- IELTS 7.0 trở lên\n- Có kinh nghiệm giảng dạy là lợi thế",
                "- Lịch dạy linh hoạt buổi tối, cuối tuần");
        JobListing ltConsultant = job(loTrinh, "Giáo dục & Đào tạo", "Full-time", "Tư vấn Tuyển sinh",
                "10,000,000 - 15,000,000 VNĐ + hoa hồng", JobStatus.OPEN, 7,
                "- Tư vấn khóa học cho học viên và phụ huynh\n- Chăm sóc học viên trong quá trình học",
                "- Giao tiếp tốt, ưu tiên có kinh nghiệm tư vấn",
                "- Hoa hồng theo doanh số\n- Học IELTS miễn phí");
        JobListing ltAdmin = job(loTrinh, "Nhân sự & Hành chính", "Full-time", "Chuyên viên Hành chính Nhân sự",
                "11,000,000 - 15,000,000 VNĐ", JobStatus.OPEN, 12,
                "- Quản lý hồ sơ nhân sự, chấm công, tính lương\n- Tổ chức sự kiện nội bộ",
                "- Tốt nghiệp Quản trị nhân lực, Luật\n- Cẩn thận, chủ động",
                "- Môi trường giáo dục thân thiện\n- Nghỉ hè 5 ngày");

        /* ==================== 4. Ứng viên & hồ sơ ==================== */
        User demoCandidate = candidate("candidate@demo.com", "Nguyễn Ứng Viên", "0912000001", true, 30,
                "Sinh viên mới tốt nghiệp ngành Kỹ thuật phần mềm, mong muốn trở thành lập trình viên Fullstack.",
                "Java, Spring Boot, ReactJS, MySQL, Git, Flutter cơ bản",
                "Đại học FPT - Kỹ thuật phần mềm (2021 - 2025), GPA 3.2/4",
                "Thực tập sinh Java tại một công ty outsource (6 tháng)\nĐồ án tốt nghiệp: website tuyển dụng (Spring Boot + React)");
        User lan = candidate("lan.nguyen@demo.com", "Nguyễn Thị Lan", "0912000002", true, 28,
                "DevOps Engineer 4 năm kinh nghiệm, yêu thích tự động hóa và hạ tầng cloud.",
                "AWS, Kubernetes, Docker, Terraform, GitLab CI, Linux",
                "Đại học Bách khoa Hà Nội - Công nghệ thông tin (2015 - 2020)",
                "2022 - nay: DevOps Engineer tại công ty thương mại điện tử\n2020 - 2022: System Engineer");
        User minh = candidate("minh.tran@demo.com", "Trần Đức Minh", "0912000003", true, 27,
                "Backend developer 3 năm kinh nghiệm với Java và Golang, từng làm hệ thống thanh toán.",
                "Java, Spring Boot, Golang, PostgreSQL, Kafka, Redis",
                "Đại học Khoa học Tự nhiên TP.HCM - Khoa học máy tính (2016 - 2020)",
                "2021 - nay: Backend Developer tại công ty fintech\n2020 - 2021: Java Developer");
        User huong = candidate("huong.le@demo.com", "Lê Thu Hương", "0912000004", true, 26,
                "Digital marketer 2 năm kinh nghiệm ngành bán lẻ, mạnh về quảng cáo và nội dung.",
                "Facebook Ads, Google Ads, SEO, Content writing, Canva",
                "Đại học Kinh tế TP.HCM - Marketing (2018 - 2022)",
                "2022 - nay: Digital Marketing Executive tại chuỗi bán lẻ mỹ phẩm");
        User khoa = candidate("khoa.pham@demo.com", "Phạm Anh Khoa", "0912000005", true, 25,
                "UI/UX designer, đam mê thiết kế sản phẩm số dễ dùng.",
                "Figma, Adobe Illustrator, Photoshop, User research, Prototyping",
                "Đại học Kiến trúc TP.HCM - Thiết kế đồ họa (2017 - 2021)",
                "2021 - nay: UI/UX Designer tại startup giáo dục\nFreelance thiết kế nhận diện thương hiệu");
        User thao = candidate("thao.vo@demo.com", "Võ Phương Thảo", "0912000006", true, 24,
                "Kế toán tổng hợp 3 năm kinh nghiệm, cẩn thận và có trách nhiệm.",
                "Kế toán tổng hợp, MISA, Excel nâng cao, Thuế, Báo cáo tài chính",
                "Học viện Tài chính - Kế toán doanh nghiệp (2016 - 2020)",
                "2020 - nay: Kế toán tổng hợp tại công ty sản xuất");
        User duc = candidate("duc.hoang@demo.com", "Hoàng Minh Đức", "0912000007", true, 22,
                "Mobile developer chuyên Flutter, đã phát hành 3 ứng dụng trên App Store và Google Play.",
                "Flutter, Dart, Firebase, Bloc, REST API",
                "Đại học Đà Nẵng - Công nghệ thông tin (2018 - 2022)",
                "2022 - nay: Mobile Developer tại agency phần mềm");
        User ngoc = candidate("ngoc.bui@demo.com", "Bùi Bảo Ngọc", "0912000008", true, 20,
                "Chuyên viên kinh doanh B2B, luôn vượt chỉ tiêu doanh số.",
                "Bán hàng B2B, Đàm phán, CRM, Tiếng Anh giao tiếp",
                "Đại học Thương mại - Quản trị kinh doanh (2017 - 2021)",
                "2021 - nay: Sales Executive tại công ty phần mềm quản lý");
        User tuan = candidate("tuan.dang@demo.com", "Đặng Quốc Tuấn", "0912000009", true, 18,
                "Business Analyst / Data Analyst, có kinh nghiệm làm việc với khách hàng Nhật.",
                "Phân tích nghiệp vụ, SQL, Power BI, Python, Tiếng Nhật N2",
                "Đại học Ngoại thương - Hệ thống thông tin quản lý (2016 - 2020)",
                "2020 - nay: Business Analyst tại công ty outsource");
        User mai = candidate("mai.do@demo.com", "Đỗ Thanh Mai", "0912000010", true, 15,
                "Mới tốt nghiệp ngành Quản trị nhân lực, năng động, thích làm việc với con người.",
                "Tuyển dụng, Tin học văn phòng, Giao tiếp, Tổ chức sự kiện",
                "Đại học Lao động - Xã hội - Quản trị nhân lực (2020 - 2024)",
                "Thực tập sinh nhân sự 6 tháng\nCộng tác viên tổ chức sự kiện");
        // Tài khoản bị khóa để demo chức năng Khóa / Mở khóa của Admin
        User quang = candidate("quang.ngo@demo.com", "Ngô Nhật Quang", "0912000011", false, 12,
                "Sinh viên năm cuối, tìm vị trí thực tập lập trình.",
                "Java cơ bản, HTML, CSS",
                "Đại học Công nghiệp Hà Nội - CNTT (2021 - 2025)",
                "Chưa có kinh nghiệm đi làm");

        /* ==================== 5. Đơn ứng tuyển ở mọi trạng thái ==================== */
        // ----- Nhà tuyển dụng recruiter@demo.com: đủ các bước để demo -----
        // HIRED: đi hết quy trình
        JobApplication a = apply(lan, fptDevops, ago(14, 9), "Em có 4 năm kinh nghiệm vận hành Kubernetes trên AWS.");
        shortlist(a, "Kinh nghiệm phù hợp, ưu tiên phỏng vấn sớm", ago(13, 10));
        InterviewSlot slot = interview(a, ago(10, 9), "https://meet.google.com/fpt-devops-01", null, ago(13, 11));
        feedback(slot, 88, FeedbackResult.PASS, "Nắm vững Kubernetes, Terraform. Giao tiếp tốt.", ago(10, 11));
        Offer offer = offer(a, 36_000_000, 14, "Thử việc 2 tháng hưởng 100% lương.", ago(8, 9));
        respondOffer(offer, true, ago(7, 20));

        // INTERVIEW_SCHEDULED và đã tới giờ phỏng vấn -> nhà tuyển dụng bấm "Chấm PV" được ngay
        a = apply(minh, fptDevops, ago(6, 14), "Em muốn chuyển hướng sang DevOps, đã tự học Docker và Kubernetes.");
        shortlist(a, "Backend tốt, cần kiểm tra thêm kiến thức hạ tầng", ago(5, 9));
        interview(a, now.minusMinutes(30), "https://meet.google.com/fpt-devops-02", null, ago(4, 10));

        // INTERVIEW_PASSED -> nhà tuyển dụng có thể "Gửi Offer"
        a = apply(tuan, fptBa, ago(12, 8), "Tôi có 4 năm làm BA cho dự án khách hàng Nhật.");
        shortlist(a, null, ago(11, 9));
        slot = interview(a, ago(4, 14), null, "Phòng họp 3A, Tòa nhà FPT, 17 Duy Tân", ago(9, 10));
        feedback(slot, 82, FeedbackResult.PASS, "Tư duy phân tích tốt, tiếng Nhật lưu loát.", ago(4, 16));

        // REJECTED sau phỏng vấn (FAIL)
        a = apply(mai, fptBa, ago(11, 15), "Em mới tốt nghiệp nhưng rất muốn học nghề BA.");
        shortlist(a, null, ago(10, 9));
        slot = interview(a, ago(6, 9), "https://meet.google.com/fpt-ba-03", null, ago(9, 14));
        feedback(slot, 45, FeedbackResult.FAIL, "Chưa có kinh nghiệm thực tế, kiến thức nghiệp vụ còn yếu.", ago(6, 11));

        // APPLIED (chờ duyệt) -> nhà tuyển dụng có thể Shortlist / Từ chối, ứng viên có thể rút đơn
        apply(demoCandidate, fptIntern, ago(1, 10), "Em đã hoàn thành đồ án Spring Boot và mong muốn được học hỏi thêm.");
        apply(quang, fptIntern, ago(2, 16), "Em là sinh viên năm cuối, có thể đi thực tập toàn thời gian.");

        // SHORTLISTED
        a = apply(duc, bxFlutter, ago(8, 9), "Tôi đã phát hành 3 ứng dụng Flutter, link portfolio trong CV.");
        shortlist(a, "Portfolio tốt", ago(6, 10));

        // INTERVIEW_SCHEDULED trong tương lai
        a = apply(demoCandidate, bxFlutter, ago(7, 20), "Em có làm ứng dụng Flutter trong đồ án môn học.");
        shortlist(a, "Fresher tiềm năng", ago(5, 15));
        interview(a, inDays(2, 15), "https://meet.google.com/bx-flutter-02", null, ago(1, 9));

        // OFFER_DECLINED (tin đã đóng)
        a = apply(tuan, bxPm, ago(32, 9), "Tôi có tiếng Nhật N2 và 2 năm hỗ trợ quản lý dự án.");
        shortlist(a, null, ago(30, 10));
        slot = interview(a, ago(27, 10), null, "Văn phòng Đà Nẵng, 02 Quang Trung", ago(30, 11));
        feedback(slot, 78, FeedbackResult.PASS, "Phù hợp, cần thêm kinh nghiệm quản lý nhân sự.", ago(27, 15));
        offer = offer(a, 40_000_000, 10, "Hỗ trợ chi phí chuyển đến Đà Nẵng.", ago(25, 9));
        respondOffer(offer, false, ago(23, 18));

        // ----- PayNest Fintech -----
        a = apply(minh, pnGolang, ago(15, 10), "Tôi có 2 năm làm hệ thống thanh toán bằng Golang.");
        shortlist(a, null, ago(14, 9));
        slot = interview(a, ago(9, 10), "https://meet.google.com/paynest-be-01", null, ago(13, 9));
        feedback(slot, 90, FeedbackResult.PASS, "Rất mạnh về thiết kế hệ thống.", ago(9, 12));
        offer(a, 45_000_000, 21, "Thưởng ký hợp đồng 10 triệu.", ago(2, 10)); // OFFERED, chờ ứng viên trả lời

        a = apply(khoa, pnDesigner, ago(9, 11), "Portfolio của tôi có 2 ứng dụng fintech.");
        shortlist(a, null, ago(7, 9));
        interview(a, inDays(3, 10), null, "Tầng 12, 51 Nguyễn Văn Linh, Quận 7", ago(2, 15));

        apply(lan, pnGolang, ago(2, 21), "Tôi muốn ứng tuyển vị trí backend để phát triển thêm kỹ năng lập trình.");

        a = apply(thao, pnRisk, ago(5, 9), "Tôi có nền tảng tài chính và thành thạo SQL.");
        shortlist(a, null, ago(3, 14));

        a = apply(demoCandidate, pnGolang, ago(10, 22), "Em chưa có kinh nghiệm Golang nhưng học rất nhanh.");
        reject(a, "Vị trí yêu cầu tối thiểu 2 năm kinh nghiệm backend, hồ sơ chưa đáp ứng.", ago(8, 10));

        // ----- TVB Digital -----
        a = apply(thao, tvbAccountant, ago(22, 9), "Tôi có 3 năm kinh nghiệm kế toán tổng hợp.");
        shortlist(a, null, ago(21, 9));
        slot = interview(a, ago(18, 9), null, "68 Bà Triệu, Hoàn Kiếm, Hà Nội", ago(20, 10));
        feedback(slot, 85, FeedbackResult.PASS, "Chuyên môn vững, phù hợp văn hóa.", ago(18, 11));
        offer = offer(a, 20_000_000, 5, null, ago(16, 9));
        respondOffer(offer, true, ago(15, 19));

        a = apply(ngoc, tvbSales, ago(10, 10), "Tôi luôn đạt 120% chỉ tiêu doanh số năm qua.");
        shortlist(a, null, ago(9, 9));
        slot = interview(a, ago(3, 15), null, "68 Bà Triệu, Hoàn Kiếm, Hà Nội", ago(8, 9));
        feedback(slot, 80, FeedbackResult.PASS, "Kỹ năng thuyết phục tốt.", ago(3, 17));

        a = apply(demoCandidate, tvbData, ago(18, 9), "Em thành thạo SQL và có làm dashboard trong đồ án.");
        shortlist(a, null, ago(16, 10));
        slot = interview(a, ago(12, 14), "https://meet.google.com/tvb-data-01", null, ago(15, 9));
        feedback(slot, 76, FeedbackResult.PASS, "Fresher nhưng tư duy dữ liệu tốt.", ago(12, 16));
        offer(a, 18_000_000, 14, "Tham gia chương trình đào tạo Data 3 tháng.", ago(1, 10)); // OFFERED -> demo Chấp nhận / Từ chối

        apply(tuan, tvbData, ago(1, 8), "Tôi có kinh nghiệm Power BI và Python.");

        // ----- Chợ Xanh Commerce -----
        a = apply(huong, cxMarketing, ago(7, 9), "Tôi đã quản lý ngân sách quảng cáo 200 triệu/tháng.");
        shortlist(a, null, ago(5, 10));
        interview(a, inDays(1, 10), "https://meet.google.com/choxanh-mkt-01", null, ago(2, 9));

        apply(ngoc, cxContent, ago(4, 20), "Tôi có kênh TikTok cá nhân 20.000 người theo dõi.");

        a = apply(mai, cxSupport, ago(38, 9), "Em giao tiếp tốt và có thể làm theo ca.");
        shortlist(a, null, ago(37, 9));
        slot = interview(a, ago(35, 9), null, "120 Cộng Hòa, Tân Bình", ago(37, 10));
        feedback(slot, 75, FeedbackResult.PASS, "Thái độ tốt.", ago(35, 10));
        offer = offer(a, 10_000_000, -20, null, ago(34, 9));
        respondOffer(offer, true, ago(33, 9));

        // ----- Hải Đăng Logistics -----
        a = apply(mai, hdRecruiter, ago(6, 9), "Em có 6 tháng thực tập tuyển dụng.");
        shortlist(a, "Fresher, cần đào tạo thêm", ago(3, 10));

        apply(ngoc, hdImport, ago(3, 11), "Tôi muốn chuyển sang lĩnh vực logistics.");

        // ----- Bloom Creative Studio -----
        a = apply(khoa, blGraphic, ago(15, 9), "Tôi có 4 năm làm branding cho thương hiệu tiêu dùng.");
        shortlist(a, null, ago(14, 9));
        slot = interview(a, ago(11, 10), null, "36 Nguyễn Đình Chiểu, Quận 1", ago(13, 9));
        feedback(slot, 87, FeedbackResult.PASS, "Portfolio ấn tượng.", ago(11, 12));
        offer = offer(a, 19_000_000, 15, null, ago(9, 9));
        respondOffer(offer, false, ago(8, 21));

        a = apply(huong, blSocial, ago(8, 10), "Tôi viết content và lên kế hoạch social cho 3 thương hiệu.");
        shortlist(a, null, ago(6, 15));

        // ----- Lộ Trình Education -----
        a = apply(ngoc, ltConsultant, ago(6, 9), "Tôi có kinh nghiệm tư vấn bán hàng.");
        reject(a, "Trung tâm ưu tiên ứng viên có kinh nghiệm trong lĩnh vực giáo dục.", ago(4, 10));

        a = apply(mai, ltAdmin, ago(10, 9), "Em tốt nghiệp chuyên ngành Quản trị nhân lực.");
        shortlist(a, null, ago(5, 9));
        interview(a, inDays(4, 9), null, "25 Xuân Thủy, Cầu Giấy, Hà Nội", ago(1, 14));

        /* ==================== 6. Đánh giá công ty ==================== */
        review(fpt, lan, 5, "Quy trình tuyển dụng nhanh, chuyên nghiệp. Môi trường làm việc nhiều cơ hội học hỏi.", 6);
        review(fpt, minh, 4, "Nhà tuyển dụng phản hồi nhanh, câu hỏi phỏng vấn sát thực tế.", 3);
        review(fpt, tuan, 4, "Phỏng vấn thân thiện, được trao đổi rõ về dự án.", 4);
        review(fpt, mai, 3, "Chưa đạt nhưng nhận được góp ý rất hữu ích.", 5);
        review(bienXanh, duc, 4, "Đội ngũ trẻ, sếp dễ nói chuyện.", 5);
        review(bienXanh, tuan, 4, "Offer tốt nhưng tôi chưa sắp xếp chuyển đến Đà Nẵng được.", 22);
        review(payNest, minh, 5, "Phỏng vấn kỹ thuật chất lượng, đãi ngộ cạnh tranh.", 8);
        review(payNest, khoa, 4, "Văn phòng đẹp, đội sản phẩm rất chuyên nghiệp.", 6);
        review(payNest, demoCandidate, 3, "Yêu cầu kinh nghiệm cao, chưa phù hợp với fresher.", 7);
        review(tvb, thao, 5, "Chế độ phúc lợi tốt, đồng nghiệp hỗ trợ nhiệt tình.", 10);
        review(tvb, ngoc, 4, "Quy trình rõ ràng, phản hồi đúng hẹn.", 2);
        review(choXanh, huong, 4, "Công ty trẻ, nhiều thử thách thú vị.", 3);
        review(choXanh, mai, 3, "Công việc ca kíp hơi vất vả nhưng được đào tạo bài bản.", 20);
        review(choXanh, ngoc, 2, "Chờ phản hồi hơi lâu.", 1);
        review(haiDang, mai, 4, "Anh chị HR rất thân thiện.", 2);
        review(bloom, khoa, 5, "Không khí sáng tạo, team dễ thương.", 7);
        review(bloom, huong, 4, "Dự án đa dạng, học được nhiều.", 4);
        review(loTrinh, ngoc, 3, "Từ chối nhanh và có giải thích lý do.", 3);
    }

    /* ==================== Hàm hỗ trợ: tạo dữ liệu gốc ==================== */

    // Lấy tài khoản theo email, chưa có thì tạo mới (mật khẩu 123456)
    private User user(String email, String fullName, String phone, Role role, int createdDaysAgo) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User created = userRepository.save(User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(DEMO_PASSWORD))
                    .fullName(fullName)
                    .phone(phone)
                    .role(role)
                    .isActive(true)
                    .build());
            setCreatedAt("users", created.getId(), ago(createdDaysAgo, 9));
            return created;
        });
    }

    // Tạo tài khoản ứng viên + hồ sơ + file CV mẫu
    private User candidate(String email, String fullName, String phone, boolean active, int createdDaysAgo,
                           String bio, String skills, String education, String experience) {
        User candidate = user(email, fullName, phone, Role.JOB_SEEKER, createdDaysAgo);
        candidate.setIsActive(active);

        if (profileRepository.findByUserId(candidate.getId()).isEmpty()) {
            profileRepository.save(CandidateProfile.builder()
                    .user(candidate)
                    .bio(bio)
                    .skills(skills)
                    .education(education)
                    .experience(experience)
                    .resumeUrl(copySampleCv(email))
                    .build());
        }
        return candidate;
    }

    private void industry(String name, String description) {
        if (!industryRepository.existsByName(name)) {
            industryRepository.save(Industry.builder().name(name).description(description).build());
        }
    }

    // cityAndAddress: "Thành phố 1", "Địa chỉ 1", "Thành phố 2", "Địa chỉ 2", ...
    private Company company(User recruiter, String name, String website, String description, String... cityAndAddress) {
        Company company = Company.builder()
                .name(name)
                .website(website)
                .description(description)
                .recruiter(recruiter)
                .locations(new ArrayList<>())
                .build();
        for (int i = 0; i < cityAndAddress.length; i += 2) {
            company.getLocations().add(CompanyLocation.builder()
                    .company(company)
                    .city(cityAndAddress[i])
                    .address(cityAndAddress[i + 1])
                    .country("Việt Nam")
                    .build());
        }
        return companyRepository.save(company);
    }

    // Dùng khi CSDL chưa có FPT Software (DataInitializer cũ đã tạo sẵn 3 tin này)
    private Company createFptWithBaseJobs(User recruiter) {
        Company fpt = company(recruiter, "FPT Software", "https://fptsoftware.com",
                "Công ty phần mềm hàng đầu Việt Nam với hơn 30.000 nhân viên.",
                "Hà Nội", "Tòa nhà FPT, 17 Duy Tân, Cầu Giấy",
                "Hồ Chí Minh", "Lô T2, Khu Công nghệ cao, TP. Thủ Đức");
        job(fpt, "Công nghệ thông tin (IT)", "Full-time", "Java Spring Boot Developer",
                "20,000,000 - 35,000,000 VNĐ", JobStatus.OPEN, 5,
                "- Phát triển REST API với Spring Boot\n- Thiết kế cơ sở dữ liệu MySQL",
                "- Tối thiểu 1 năm kinh nghiệm Java\n- Hiểu biết về JPA/Hibernate",
                "- Lương tháng 13\n- Bảo hiểm sức khỏe");
        job(fpt, "Công nghệ thông tin (IT)", "Hybrid", "ReactJS Frontend Developer",
                "15,000,000 - 28,000,000 VNĐ", JobStatus.OPEN, 5,
                "- Xây dựng giao diện web với React\n- Tích hợp REST API",
                "- Thành thạo JavaScript, React Hooks\n- Biết sử dụng Git",
                "- Làm việc Hybrid 3 ngày/tuần\n- Laptop cấu hình cao");
        job(fpt, "Công nghệ thông tin (IT)", "Full-time", "Tester / QA Engineer",
                "12,000,000 - 20,000,000 VNĐ", JobStatus.OPEN, 5,
                "- Viết test case, kiểm thử chức năng\n- Báo cáo và theo dõi lỗi",
                "- Cẩn thận, tỉ mỉ\n- Biết viết SQL cơ bản",
                "- Đào tạo ISTQB miễn phí");
        return fpt;
    }

    private JobListing job(Company company, String industryName, String jobTypeName, String title, String salary,
                           JobStatus status, int postedDaysAgo,
                           String responsibilities, String requirements, String benefits) {
        JobListing job = JobListing.builder()
                .title(title)
                .salaryRange(salary)
                .status(status)
                .company(company)
                .industry(industryRepository.findByName(industryName).orElse(null))
                .jobType(jobTypeRepository.findByName(jobTypeName).orElse(null))
                .build();
        job.setJobDescription(JobDescription.builder()
                .jobListing(job)
                .responsibilities(responsibilities)
                .requirements(requirements)
                .benefits(benefits)
                .build());
        jobListingRepository.save(job);
        setCreatedAt("job_listings", job.getId(), ago(postedDaysAgo, 8));
        return job;
    }

    private void review(Company company, User author, int rating, String comment, int daysAgo) {
        if (reviewRepository.existsByCompanyIdAndUserId(company.getId(), author.getId())) {
            return; // mỗi ứng viên chỉ đánh giá 1 lần / công ty
        }
        Review review = reviewRepository.save(Review.builder()
                .company(company).user(author).rating(rating).comment(comment).build());
        setCreatedAt("reviews", review.getId(), ago(daysAgo, 20));
    }

    /* ==================== Hàm hỗ trợ: các bước tuyển dụng ==================== */
    // Mỗi bước cập nhật trạng thái đơn + tạo thông báo giống hệt khi thao tác trên giao diện.

    private JobApplication apply(User candidate, JobListing job, LocalDateTime at, String coverLetter) {
        // Dùng CV mặc định trong hồ sơ; hồ sơ chưa có CV thì dùng CV mẫu
        String resumeUrl = profileRepository.findByUserId(candidate.getId())
                .map(CandidateProfile::getResumeUrl)
                .filter(url -> url != null && !url.isBlank())
                .orElseGet(() -> copySampleCv(candidate.getEmail()));
        JobApplication application = applicationRepository.save(JobApplication.builder()
                .jobListing(job)
                .candidate(candidate)
                .resumeUrl(resumeUrl)
                .coverLetter(coverLetter)
                .status(ApplicationStatus.APPLIED)
                .build());
        setCreatedAt("job_applications", application.getId(), at);
        notify(recruiterOf(application), "Có hồ sơ ứng tuyển mới",
                candidate.getFullName() + " vừa ứng tuyển vị trí \"" + job.getTitle() + "\".", at);
        return application;
    }

    private void shortlist(JobApplication application, String note, LocalDateTime at) {
        Shortlist shortlist = shortlistRepository.save(Shortlist.builder()
                .application(application).recruiter(recruiterOf(application)).note(note).build());
        setCreatedAt("shortlists", shortlist.getId(), at);
        application.setStatus(ApplicationStatus.SHORTLISTED);
        notify(application.getCandidate(), "Hồ sơ đã được chọn",
                "Hồ sơ của bạn cho vị trí \"" + titleOf(application)
                        + "\" đã vào danh sách rút gọn. Nhà tuyển dụng sẽ sớm hẹn lịch phỏng vấn.", at);
    }

    // Buổi phỏng vấn dài 1 tiếng; có link online hoặc địa điểm
    private InterviewSlot interview(JobApplication application, LocalDateTime start, String meetingLink,
                                    String location, LocalDateTime at) {
        InterviewSlot slot = interviewSlotRepository.save(InterviewSlot.builder()
                .application(application)
                .startTime(start)
                .endTime(start.plusHours(1))
                .meetingLink(meetingLink)
                .location(location)
                .status(InterviewStatus.SCHEDULED)
                .build());
        setCreatedAt("interview_slots", slot.getId(), at);
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        notify(application.getCandidate(), "Lịch phỏng vấn mới",
                "Bạn có lịch phỏng vấn vị trí \"" + titleOf(application) + "\" lúc " + start.format(TIME_FORMAT) + ".", at);
        return slot;
    }

    // PASS -> INTERVIEW_PASSED, FAIL -> REJECTED (giống InterviewFeedbackService)
    private void feedback(InterviewSlot slot, int score, FeedbackResult result, String comments, LocalDateTime at) {
        JobApplication application = slot.getApplication();
        InterviewFeedback feedback = feedbackRepository.save(InterviewFeedback.builder()
                .interviewSlot(slot)
                .interviewer(recruiterOf(application))
                .score(score)
                .comments(comments)
                .result(result)
                .build());
        setCreatedAt("interview_feedback", feedback.getId(), at);
        slot.setStatus(InterviewStatus.COMPLETED);

        if (result == FeedbackResult.PASS) {
            application.setStatus(ApplicationStatus.INTERVIEW_PASSED);
            notify(application.getCandidate(), "Bạn đã đạt vòng phỏng vấn",
                    "Chúc mừng! Bạn đã vượt qua vòng phỏng vấn vị trí \"" + titleOf(application) + "\".", at);
        } else {
            application.setStatus(ApplicationStatus.REJECTED);
            application.setRejectionReason("Kết quả phỏng vấn chưa đạt");
            notify(application.getCandidate(), "Kết quả phỏng vấn",
                    "Rất tiếc, bạn chưa vượt qua vòng phỏng vấn vị trí \"" + titleOf(application) + "\".", at);
        }
    }

    // startInDays: ngày bắt đầu làm việc tính từ hôm nay (số âm = đã bắt đầu)
    private Offer offer(JobApplication application, long salary, int startInDays, String notes, LocalDateTime at) {
        Offer offer = offerRepository.save(Offer.builder()
                .application(application)
                .salary(BigDecimal.valueOf(salary))
                .startDate(LocalDate.now().plusDays(startInDays))
                .notes(notes)
                .status(OfferStatus.PENDING)
                .build());
        setCreatedAt("offers", offer.getId(), at);
        application.setStatus(ApplicationStatus.OFFERED);
        notify(application.getCandidate(), "Bạn nhận được Offer",
                "Chúc mừng! Bạn nhận được thư mời làm việc cho vị trí \"" + titleOf(application) + "\".", at);
        return offer;
    }

    private void respondOffer(Offer offer, boolean accepted, LocalDateTime at) {
        JobApplication application = offer.getApplication();
        offer.setStatus(accepted ? OfferStatus.ACCEPTED : OfferStatus.DECLINED);
        application.setStatus(accepted ? ApplicationStatus.HIRED : ApplicationStatus.OFFER_DECLINED);
        notify(recruiterOf(application), accepted ? "Ứng viên đã nhận Offer" : "Ứng viên từ chối Offer",
                application.getCandidate().getFullName() + (accepted ? " đã chấp nhận" : " đã từ chối")
                        + " Offer vị trí \"" + titleOf(application) + "\".", at);
    }

    private void reject(JobApplication application, String reason, LocalDateTime at) {
        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectionReason(reason);
        notify(application.getCandidate(), "Kết quả ứng tuyển",
                "Rất tiếc, hồ sơ của bạn cho vị trí \"" + titleOf(application) + "\" chưa phù hợp.", at);
    }

    // Thông báo cũ hơn 2 ngày coi như đã đọc
    private void notify(User user, String title, String message, LocalDateTime at) {
        Notification notification = notificationRepository.save(Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .isRead(at.isBefore(now.minusDays(2)))
                .build());
        setCreatedAt("notifications", notification.getId(), at);
    }

    /* ==================== Hàm hỗ trợ khác ==================== */

    private User recruiterOf(JobApplication application) {
        return application.getJobListing().getCompany().getRecruiter();
    }

    private String titleOf(JobApplication application) {
        return application.getJobListing().getTitle();
    }

    // Thời điểm `days` ngày trước lúc `hour` giờ (không vượt quá hiện tại)
    private LocalDateTime ago(int days, int hour) {
        LocalDateTime time = LocalDate.now().minusDays(days).atTime(hour, 0);
        return time.isAfter(now) ? now.minusMinutes(10) : time;
    }

    // Thời điểm `days` ngày tới lúc `hour` giờ
    private LocalDateTime inDays(int days, int hour) {
        return LocalDate.now().plusDays(days).atTime(hour, 0);
    }

    /*
     * created_at được Hibernate tự gán = thời điểm lưu (@CreationTimestamp) và không cho sửa qua entity.
     * Dữ liệu demo cần ngày trong quá khứ ("Đăng 5 ngày trước") nên cập nhật trực tiếp bằng SQL.
     */
    private void setCreatedAt(String table, Long id, LocalDateTime time) {
        jdbcTemplate.update("UPDATE " + table + " SET created_at = ? WHERE id = ?", time, id);
    }

    // Copy file CV mẫu (resources/seed/sample-cv.pdf) vào uploads/resumes, trả về đường dẫn dùng trong API
    private String copySampleCv(String email) {
        String fileName = "cv-" + email.substring(0, email.indexOf('@')).replace('.', '-') + ".pdf";
        try (InputStream input = new ClassPathResource("seed/sample-cv.pdf").getInputStream()) {
            Path target = Paths.get(uploadDir, "resumes").toAbsolutePath().normalize();
            Files.createDirectories(target);
            Path file = target.resolve(fileName);
            if (!Files.exists(file)) {
                Files.copy(input, file);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Không thể tạo file CV mẫu", e);
        }
        return "/api/v1/files/resumes/" + fileName;
    }
}
