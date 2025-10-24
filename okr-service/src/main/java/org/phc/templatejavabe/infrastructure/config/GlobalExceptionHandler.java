package org.phc.templatejavabe.infrastructure.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Autowired
    private MessageSource messageSource;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        logger.error("Validation error occurred", ex);
        
        Locale locale = LocaleContextHolder.getLocale();
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            
            // Try to get translated message if it's a message key
            if (errorMessage != null && errorMessage.startsWith("validation.")) {
                try {
                    errorMessage = messageSource.getMessage(errorMessage, null, locale);
                } catch (Exception e) {
                    // Use default message if translation not found
                }
            }
            
            errors.put(fieldName, errorMessage);
        });
        
        response.put("timestamp", Instant.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", messageSource.getMessage("error.validation", null, locale));
        response.put("message", messageSource.getMessage("error.validation", null, locale));
        response.put("errors", errors);
        response.put("path", request.getDescription(false).replace("uri=", ""));
        response.put("exception", ex.getClass().getSimpleName());
        response.put("details", ex.getMessage());
        
        // Add stack trace for debugging
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        ex.printStackTrace(pw);
        response.put("stackTrace", sw.toString());
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        
        logger.error("Illegal argument exception occurred", ex);
        
        Locale locale = LocaleContextHolder.getLocale();
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", Instant.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", messageSource.getMessage("error.general", null, locale));
        response.put("message", ex.getMessage());
        response.put("path", request.getDescription(false).replace("uri=", ""));
        response.put("exception", ex.getClass().getSimpleName());
        response.put("details", ex.getMessage());
        
        // Add stack trace for debugging
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        ex.printStackTrace(pw);
        response.put("stackTrace", sw.toString());
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex, WebRequest request) {
        
        logger.error("Runtime exception occurred", ex);
        
        Locale locale = LocaleContextHolder.getLocale();
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", Instant.now());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", messageSource.getMessage("error.server", null, locale));
        response.put("message", ex.getMessage()); // Include actual error message
        response.put("path", request.getDescription(false).replace("uri=", ""));
        response.put("exception", ex.getClass().getSimpleName());
        response.put("details", ex.getMessage());
        
        // Add stack trace for debugging
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        ex.printStackTrace(pw);
        response.put("stackTrace", sw.toString());
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, WebRequest request) {
        
        logger.error("Generic exception occurred", ex);
        
        Locale locale = LocaleContextHolder.getLocale();
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", Instant.now());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", messageSource.getMessage("error.server", null, locale));
        response.put("message", ex.getMessage()); // Include actual error message
        response.put("path", request.getDescription(false).replace("uri=", ""));
        response.put("exception", ex.getClass().getSimpleName());
        response.put("details", ex.getMessage());
        
        // Add stack trace for debugging
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        ex.printStackTrace(pw);
        response.put("stackTrace", sw.toString());
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

