import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Test với password "password"
        String password = "password";
        String hash = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("Hash: " + hash);
        
        // Test với hash có sẵn trong database
        String existingHash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";
        boolean matches = encoder.matches(password, existingHash);
        System.out.println("Password 'password' matches existing hash: " + matches);
        
        // Test với các password khác
        String[] testPasswords = {"123456", "admin", "test", "secret"};
        for (String testPassword : testPasswords) {
            boolean testMatches = encoder.matches(testPassword, existingHash);
            System.out.println("Password '" + testPassword + "' matches existing hash: " + testMatches);
        }
    }
}


